const dynamicChildrenStack = [];
let currentDynamicChildren = null;

// openBlock 用来创建一个新的动态节点集合，并将该集合压入栈中
function openBlock() {
    dynamicChildrenStack.push((currentDynamicChildren = []));
}

function closeBlock() {
    currentDynamicChildren = dynamicChildrenStack.pop();
}

function createVNode(tag, props, children, flags) {
    const key = props && props.key;
    props && delete props.key;

    const vnode = {
        tag,
        props,
        children,
        key,
        patchFlag: flags
    }

    if (typeof flags !== 'undefined' && currentDynamicChildren) {
        currentDynamicChildren.push(vnode);
    }

    return vnode;
}

render() {
    return (openBlock(), createBlock('div', null, [
        createVNode('p', { class: 'foo' }, null, 1),
        createVNode('p', { class: 'bar' }, null)
    ]));
}

function createBlock(tag, props, children) {
    // block 本质上也是一个 vnode
    const block = createVNode(tag, props, children);

    block.dynamicChildren = currentDynamicChildren;
    closeBlock();
    return block;
}