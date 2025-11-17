// helpers/conflictUtils.js

const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const timesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

export const eventsConflict = (eventA, eventB) => {
  if (eventA.id === eventB.id) return false;

  const eventAStart = timeToMinutes(eventA.startTime);
  const eventAEnd = timeToMinutes(eventA.endTime);
  const eventBStart = timeToMinutes(eventB.startTime);
  const eventBEnd = timeToMinutes(eventB.endTime);

  if (!timesOverlap(eventAStart, eventAEnd, eventBStart, eventBEnd)) {
    return false;
  }

  const staffIdsA = new Set(eventA.assignedStaff.map((s) => s.id));
  if (staffIdsA.size === 0) return false;

  for (const staff of eventB.assignedStaff) {
    if (staffIdsA.has(staff.id)) {
      return true;
    }
  }
  return false;
};

const buildConflictGraph = (events) => {
  const graph = new Map();
  events.forEach((event) => graph.set(event.id, []));

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (eventsConflict(events[i], events[j])) {
        graph.get(events[i].id).push(events[j].id);
        graph.get(events[j].id).push(events[i].id);
      }
    }
  }
  return graph;
};

const dfs = (eventId, graph, visited, currentCluster) => {
  visited.add(eventId);
  currentCluster.push(eventId);

  const neighbors = graph.get(eventId);
  for (const neighborId of neighbors) {
    if (!visited.has(neighborId)) {
      dfs(neighborId, graph, visited, currentCluster);
    }
  }
};

export const calculateConflictClusters = (dailyEvents) => {
  const graph = buildConflictGraph(dailyEvents);
  const visited = new Set();
  const clusters = [];
  const eventMap = new Map(dailyEvents.map((e) => [e.id, e]));

  for (const event of dailyEvents) {
    if (!visited.has(event.id)) {
      const currentClusterIds = [];
      dfs(event.id, graph, visited, currentClusterIds);

      const hasConflict =
        currentClusterIds.length > 1 ||
        (currentClusterIds.length === 1 &&
          graph.get(currentClusterIds[0]).length > 0);

      if (hasConflict) {
        const clusterEvents = currentClusterIds.map((id) => eventMap.get(id));
        clusterEvents.sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );
        clusters.push(clusterEvents);
      }
    }
  }

  const conflictingEventIds = new Set(clusters.flat().map((e) => e.id));
  const nonConflictingEvents = dailyEvents
    .filter((e) => !conflictingEventIds.has(e.id))
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return { clusteredConflicts: clusters, nonConflictingEvents };
};
