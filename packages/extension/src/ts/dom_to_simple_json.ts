export type SimpleJsonNode = {
  tag: string;
  attributes: Record<string, string>;
  children?: Array<SimpleJsonNode | string>;
};

const TAGS_TO_IGNORE = new Set([
  //
  'script',
  'style',
  'link',
  'meta',
  'noscript',
  'iframe',
  'object',
  'embed',
  'svg',
  'canvas',
  'audio',
  'video',
  'source',
  'track',
  'map',
  'area',
  'param',
  'picture',
  'img',
  'br',
  'hr',
  'select',
  'form',
  'option',
]);

export function element_to_simple_json(element: Element): SimpleJsonNode {
  const attribute_map: Record<string, string> = {};
  for (const attribute of Array.from(element.attributes)) {
    attribute_map[attribute.name] = attribute.value;
  }

  const child_nodes: Array<SimpleJsonNode | string> = [];
  for (const child_node of Array.from(element.childNodes)) {
    if (child_node.nodeType === Node.ELEMENT_NODE) {
      const child_element = child_node as Element;
      if (!TAGS_TO_IGNORE.has(child_element.tagName.toLowerCase())) {
        child_nodes.push(element_to_simple_json(child_element));
      }
      continue;
    }

    if (child_node.nodeType === Node.TEXT_NODE) {
      const text_content = child_node.textContent;
      if (!text_content) {
        continue;
      }

      const trimmed_text_content = text_content.trim();
      if (trimmed_text_content.length > 0) {
        child_nodes.push(trimmed_text_content);
      }
    }
  }

  const simple_node: SimpleJsonNode = {
    tag: element.tagName.toLowerCase(),
    attributes: attribute_map,
  };

  if (child_nodes.length > 0) {
    simple_node.children = child_nodes;
  }

  return simple_node;
}
