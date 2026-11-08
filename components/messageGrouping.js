// Grouping for 3 — double user / double AI bubbles. A message is first
// in its group when the previous message is from the other side (or none),
// and last when the next message is from the other side (or none).
// ChatBubble turns isFirst/isLast into corner radii: outer corners stay
// round (24), inner adjoining corners shrink to 6.
export function getGroupFlags(list, index) {
  const prev = list[index - 1];
  const next = list[index + 1];
  const role = list[index].role;
  return {
    isFirst: !prev || prev.role !== role,
    isLast: !next || next.role !== role,
  };
}
