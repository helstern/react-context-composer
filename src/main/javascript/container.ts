import React from 'react';
import { default as khan, GrapNode } from './khan';

type Provider<U, T extends { [key: string]: any }> = { [key in keyof T]: LeafFactory<U> | NodeFactory<U, any> };

type NodeFactory<T, P = {}> = (input: React.Context<T>, deps: P) => React.FunctionComponent<any>;
type LeafFactory<T> = (input: React.Context<T>) => React.FunctionComponent<any>;

type ComponentNode<T> = GrapNode<(...args: any) => any> & { deps: Provider<T, any> };
const graph: Array<ComponentNode<any>> = [];
let layout: Array<ComponentNode<any>> = [];

function add(node: ComponentNode<any>) {
  graph.push(node);
  if (layout.length) {
    layout = [];
  }
}

export function addLeaf<U, T extends LeafFactory<U>>(factory: T): T {
  add({
    deps: {},
    neighbours: [],
    vertex: factory,
  });

  return factory;
}

export function addNode<K, T extends { [key: string]: any }, U extends NodeFactory<K, T>>(
  factory: U,
  deps: Provider<K, T>,
): U {
  add({
    deps,
    neighbours: Object.keys(deps).map(key => deps[key]),
    vertex: factory,
  });

  return factory;
}

export function getComponent<T, K extends { [key: string]: any }>(
  factory: (...args: any) => any,
  context: React.Context<T>,
): React.FunctionComponent<any> {
  if (0 === layout.length) {
    layout = khan(graph).reverse();
  }
  const components: Map<(...args: any) => any, React.FunctionComponent> = new Map();

  for (const node of layout) {
    const deps: { [key: string]: React.FunctionComponent<any> } = {};
    Object.keys(node.deps).reduce(function(acc, key) {
      acc[key] = components.get(node.deps[key])!!;
      return acc;
    }, deps);

    components.set(node.vertex, node.vertex(context, deps));

    if (node.vertex === factory) {
      break;
    }
  }

  return components.get(factory)!!;
}
