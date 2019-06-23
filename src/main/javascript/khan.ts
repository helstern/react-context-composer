interface Edge<T> {
  from: T;
  to: T;
}

export interface GrapNode<T> {
  neighbours: ReadonlyArray<T>;
  vertex: T;
}

function equals<T>(left: T, right: T): boolean {
  return left === right;
}

export default function khan<T, U extends GrapNode<T>>(
  graph: ReadonlyArray<U>,
  isSame: (left: T, right: T) => boolean = equals,
): U[] {
  const indegrees: Map<T, number> = new Map();
  const nodes: Map<T, U> = new Map();

  let edges: Array<Edge<T>> = [];
  const frontier: T[] = [];

  graph.forEach(node => {
    const { vertex, neighbours } = node;
    nodes.set(vertex, node);

    if (!indegrees.has(vertex)) {
      indegrees.set(vertex, 0);
    }

    neighbours.forEach(neighbour => {
      edges.push({ from: vertex, to: neighbour });
      let indegree = 1;
      if (indegrees.has(neighbour)) {
        indegree = indegree + indegrees.get(neighbour)!!;
      }
      indegrees.set(neighbour, indegree);
    });
  }, []);

  indegrees.forEach((indegree, vertex) => {
    if (0 === indegree) {
      frontier.push(vertex);
    }
  });

  const sortedList: T[] = [];
  while (frontier.length) {
    const vertex = frontier.pop()!!;
    sortedList.push(vertex);

    function filter({ from, to }: Edge<T>): boolean {
      // if this is an edge of the current node with no incoming nodes
      // remove the edge and calc the new in-degree of the other node
      // if the new in-degree is 0 then the other node is added to the frontier
      if (isSame(from, vertex)) {
        const indegree = indegrees.get(to)!! - 1;
        if (indegree === 0) {
          frontier.push(to);
        } else if (indegree > 0) {
          indegrees.set(to, indegree);
        } else {
          throw new Error('indegree less than zero')
        }

        return false;
      }

      return true;
    }
    edges = edges.filter(filter);
  }

  return sortedList.map(vertex => nodes.get(vertex)!!);
}
