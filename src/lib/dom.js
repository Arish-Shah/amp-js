/**
 * Move nodes from to a new parent, or remove them from the old parent if no new parent is given
 */
export const moveNodes = (
  oldParent,
  previous = null,
  after = null,
  newParent,
  before
) => {
  let nodeToMove = previous ? previous.nextSibling : oldParent.firstChild;
  if (nodeToMove !== null) {
    // If the new Parent is a Node, we move the nodes instead of removing them
    let move;
    if (newParent instanceof Node) {
      move = () => newParent.insertBefore(nodeToMove, before);
    } else {
      move = () => oldParent.removeChild(nodeToMove);
    }
    let nextNode;
    while (nodeToMove !== after) {
      nextNode = nodeToMove.nextSibling;
      move(nodeToMove);
      nodeToMove = nextNode;
    }
  }
};
