// 定义状态机的状态
const State = {
    initial: 1,   // 初始状态
    tagOpen: 2,   // 标签开始状态
    tagName: 3,   // 标签名称状态
    text: 4,      // 文本状态
    tagEnd: 5,    // 结束标签状态
    tagEndName: 6,// 结束标签名称状态
};

// 一个辅助函数，用于判断是否是字母
function isAlpha(char: string) {
    return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z';
}

// 接收模板字符串作为参数，并将模板切割为 Token 返回
function tokenize(str: string) {
    let currentState = State.initial;
    // 用于缓存字符
    const chars: string[] = [];
    // 生成的 Token 会存储到 tokens 数组中，并作为函数的返回值返回
    const tokens: any[] = [];

    // 循环开启状态机，只要模板字符串没有被消费尽，自动机就会一直运行
    while (str) {
        // 查看第一个字符，注意这里只是查看，没有消费该字符
        const char = str[0];

        switch (currentState) {
            case State.initial:
                // 遇到字符 <
                if (char === '<') {
                    // 1 切换状态
                    currentState = State.tagOpen;
                    // 2 消费字符
                    str = str.slice(1);
                } else if (isAlpha(char)) {
                    // 1 切换状态
                    currentState = State.text;
                    // 2 将当前字母缓存到 chars 中
                    chars.push(char);
                    // 3 消费当前字符
                    str = str.slice(1);
                }
                break;
            case State.tagOpen:
                if (isAlpha(char)) {
                    currentState = State.tagName;
                    chars.push(char);
                    str = str.slice(1);
                } else if (char === '/') {
                    currentState = State.tagEnd;
                    str = str.slice(1);
                }
                break;
            case State.tagName:
                if (isAlpha(char)) {
                    chars.push(char);
                    str = str.slice(1);
                } else if (char === '>') {
                    // 1 遇到 >，切换到初始状态
                    currentState = State.initial;
                    // 2 同时创建一个 token，并添加到 tokens 中
                    tokens.push({
                        type: 'tag',
                        name: chars.join('')
                    });

                    // 3 清空 chars
                    chars.length = 0;
                    str = str.slice(1);
                }
                break;
            case State.text:
                if (isAlpha(char)) {
                    chars.push(char);
                    str = str.slice(1);
                } else if (char === '<') {
                    currentState = State.tagOpen;
                    tokens.push({
                        type: 'text',
                        content: chars.join('')
                    });
                    chars.length = 0;
                    str = str.slice(1);
                }
                break;
            case State.tagEnd:
                if (isAlpha(char)) {
                    currentState = State.tagEndName;
                    chars.push(char);
                    str = str.slice(1);
                }
                break;
            case State.tagEndName:
                if (isAlpha(char)) {
                    chars.push(char);
                    str = str.slice(1);
                } else if (char === '>') {
                    currentState = State.initial;
                    tokens.push({
                        type: 'tagEnd',
                        name: chars.join('')
                    });
                    chars.length = 0;
                    str = str.slice(1);
                }
                break;
        }
    }
    return tokens;
}

const ast = {
    type: 'Root',
    children: [
        {
            type: 'Element',
            tag: 'div',
            children: [
                {
                    type: 'Element',
                    tag: 'p',
                    children: [
                        {
                            type: 'Text',
                            content: 'Vue'
                        }
                    ]
                },
                {
                    type: 'Element',
                    tag: 'p',
                    children: [
                        {
                            type: 'Text',
                            content: 'Template'
                        }
                    ]
                }
            ]
        }
    ]
};

function parse(str: string) {
    const tokens = tokenize(str);

    const root = {
        type: 'Root',
        children: [] as any
    };

    const elementStack = [root];

    while (tokens.length) {
        const parent = elementStack[elementStack.length - 1];
        const t = tokens[0];

        switch (t.type) {
            case 'tag':
                const elementNode = {
                    type: 'Element',
                    tag: t.name,
                    children: [],
                };
                parent.children.push(elementNode);
                elementStack.push(elementNode);
                break;
            case 'text':
                parent.children.push({
                    type: 'Text',
                    content: t.content
                });
                break;
            case 'tagEnd':
                elementStack.pop();
                break;
        }
        tokens.shift();
    }

    return root;
}

export {}

interface Node {
    type: string;
    tag?: string;
    content?: string;
    children?: ASTNode[]
    [key: string]: any;
}

interface RootNode extends Node {
    type: 'Root';
}

interface ElementNode extends Node {
    type: 'Element';
    tag: string;
}

interface TextNode extends Node {
    type: 'Text',
    content: string;
}

type ASTNode = RootNode | ElementNode | TextNode;

function dump(node: ASTNode, indent = 0) {
    const type = node.type;

    const desc = type === 'Root'
        ? ''
        : type === 'Element'
            ? node.tag
            : node.content;

    console.log(`${'-'.repeat(indent)}${type}: ${desc}`);

    if (node.children) {
        node.children.forEach(n => dump(n, indent + 2));
    }
}

function traverseNode(ast: ASTNode, context) {
    const currentNode = ast;
    context.currentNode = ast;

    // 1 增加退出阶段的回调函数数组
    const existFns = [];

    // context.nodeTransforms 是一个数组，其中每一个元素都是一个函数
    const transforms = context.nodeTransforms;

    for (let i = 0; i < transforms.length; i++) {
        // 2 转换函数可以返回另外一个函数，该函数即作为退出阶段的回调函数
        const onExit = transforms[i](currentNode, context);
        if (onExit) {
            existFns.push(onExit);
        }
        if (!context.currentNode) return;
    }

    const children = currentNode.children;
    if (children) {
        for (let i = 0; i < children.length; i++) {
            context.parent = context.currentNode;
            context.childIndex = i;
            traverseNode(children[i], context);
        }
    }

    // 在节点处理的最后阶段执行缓存在 exitFns 中的回调函数
    // 注意，这里我们要反序执行
    let i = existFns.length;
    while (i--) {
        existFns[i]();
    }
}

function transform(ast: ASTNode) {
    const context = {
        // 增加 currentNode，用来存储当前正在转换的节点
        currentNode: null,
        // 增加 childIndex，用来存储当前节点在父节点的 children 中的位置索引
        childIndex: 0,
        // 增加 parent，用来存储当前转换节点的父节点
        parent: null,

        replaceNode(node) {
            context.parent.children[context.childIndex] = node;
            context.currentNode = node;
        },

        removeNode() {
            if (context.parent) {
                context.parent.children.splice(context.childIndex, 1);
                context.currentNode = null;
            }
        },

        nodeTransform: []
    };

    traverseNode(ast, context);
}

const FunctionDeclNode = {
    type: 'FunctionDecl',

    id: {
        type: 'Identifier',
        name: 'render',
    },

    params: [],

    body: [
        {
            type: 'ReturnStatement',
            return: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'h',
                },
                arguments: [
                    {
                        type: 'StringLiteral',
                        value: 'div',
                    },
                    {
                        type: 'ArrayExpression',
                        elements: [
                            {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'h',
                                },
                                arguments: [
                                    {
                                        type: 'StringLiteral',
                                        value: 'p',
                                    },
                                    {
                                        type: 'StringLiteral',
                                        value: 'Vue',
                                    }
                                ]
                            },
                            {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'h',
                                },
                                arguments: [
                                    {
                                        type: 'StringLiteral',
                                        value: 'p',
                                    },
                                    {
                                        type: 'StringLiteral',
                                        value: 'Template',
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    ]
}


function createStringLiteral(value) {
    return {
        type: 'StringLiteral',
        value
    };
}

function createIdentifier(name) {
    return {
        type: 'Identifier',
        name
    }
}

function createCallExpression(callee, args) {
    return {
        type: 'CallExpression',
        callee: createIdentifier(callee),
        arguments: args
    }
}

function createArrayExpression(elements) {
    return {
        type: 'ArrayExpression',
        elements
    }
}

function transformText(node: TextNode) {
    if (node.type !== 'Text') {
        return
    }

    node.jsNode = createStringLiteral(node.content);
}

function transformElement(node: ElementNode) {
    // 将转换代码编写在退出阶段的回调函数中
    // 这样可以保证该标签的子节点全部被处理完毕
    return () => {
        if (node.type !== 'Element') {
            return
        }

        const callExp = createCallExpression('h', [
            createStringLiteral(node.tag)
        ]);

        node.children.length === 1
            // 如果当前标签节点只有一个子节点，则直接使用子节点的 jsNode 作为参数
            ? callExp.arguments.push(node.children[0].jsNode)
            // 如果当前标签节点有多个子节点，则创建一个 ArrayExpression 节点作为参数
            : callExp.arguments.push(
                createArrayExpression(node.children?.map(c => c.jsNode))
            );

        node.jsNode = callExp;
    }
}

function transformRoot(node: RootNode) {
    return () => {
        if (node.type !== 'Root') {
            return;
        }

        const vnodeJSAST = node.children[0].jsNode;

        node.jsNode = {
            type: 'FunctionDecl',
            id: {
                type: 'Identifier',
                name: 'render'
            },
            params: [],
            body: [
                {
                    type: 'ReturnStatement',
                    return: vnodeJSAST
                }
            ]
        }
    }
}

function compile(tempalte: string) {
    const ast = parse(tempalte);
    transform(ast);
    const code = generate(ast.jsNode);
    return code;
}

function generate(node) {
    const context = {
        code: '',
        push(code) {
            context.code += code;
        },

        // 当前缩进的级别，初始值为 0，即没有缩进
        curretnIndent: 0,

        // 该函数用来换行，即在代码字符串的后面追加 \n 字符
        newline() {
            context.code += '\n' + `  `.repeat(context.curretnIndent);
        },

        // 用来缩进，即让 currentIndent 自增后，调用换行函数
        indent() {
            context.curretnIndent++;
            context.newline();
        },

        // 取消缩进
        deIndent() {
            context.curretnIndent--;
            context.newline();
        }
    };

    genNode(node, context);
    return context.code;
}

function genNode(node, context) {
    switch (node.type) {
        case 'FunctionDecl':
            genFunctionDecl(node, context);
            break;
        case 'ReturnStatement':
            genReturnStatement(node, context);
            break;
        case 'CallExpression':
            genCallExpression(node, context);
            break;
        case 'StringLiteral':
            genStringLiteral(node, context);
            break;
        case 'ArrayExpression':
            genArrayExpression(node, context);
            break;
    }
}

function genFunctionDecl(node, context) {
    const {push, indent, deIndent} = context;

    push(`function ${node.id.name} `);
    push('(');
    
    genNodeList(node.params, context);

    push(') ')
    push('{')
    indent();

    node.body.forEach(n => genNode(n, context));

    deIndent();
    push('}');
}

function genNodeList(nodes, context) {
    const {push} = context;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        genNode(node, context);

        if (i < nodes.length - 1) {
            push(', ');
        }
    }
}

function genArrayExpression(node, context) {
    const {push} = context;
    push('[');
    genNodeList(node.elements, context);
    push(']')
}

function genReturnStatement(node, context) {
    const {push} = context;

    push(`return `);
    genNode(node.return, context);
}

function genStringLiteral(node, context) {
    context.push(`'${node.value}'`);
}

function genCallExpression(node, context) {
    const {push} = context;

    const {callee, arguments: args} = node;

    push(`${callee.name}(`);
    genNode(args, context);
    push(`)`);
}


const TextModes = {
    DATA: 'DATA',
    RCDATA: 'RCDATA',
    RAWTEXT: 'RAWTEXT',
    CDATA: 'CDATA',
};

interface IContext { 
    source: string;
    mode: string;
    [key: string]: any;
}

function parse2(str: string) {
    const context: IContext = {
        // 模板内容，用于在解析过程中进行消费
        source: str,
        mode: TextModes.DATA,

        // advanceBy 函数用来消费指定数量的字符
        advanceBy(num: number) {
            // 根据给定字符数 num，截取位置 num 后的模板内容，并替换当前模板内容
            context.source = context.source.slice(num);
        },

        // 无论是开始标签还是结束标签，都可能存在无用的空白字符
    };

    // 调用 parseChildren 函数进行解析，它返回解析后得到的子节点
    // parseChildren 函数接收两个参数
    // 第一个参数是上下文对象 context
    // 第二个参数是由父代节点构成的节点栈，初始时栈为空
    const nodes = parseChildren(context, []);

    return {
        type: 'Root',
        children: nodes
    };
}


function parseChildren(context: IContext, ancestors: any[]) {
    let nodes: any[] = [];

    const {mode, source} = context;

    while (!isEnd(context, ancestors)) {
        let node

        // 只有 DATA 和 RCDATA 才支持插值节点的解析
        if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
            // 只有 DATA 才支持标签节点的解析
            if (mode === TextModes.DATA && source[0] === '<') {
                if (source[1] === '!') {
                    if (source.startsWith('<!--')) {
                        // 注释
                        node = parseComment(context);
                    } else if (source.startsWith('<![CDATA[')) {
                        // CDATA
                        node = parseCDATA(context, ancestors);
                    }
                } else if (source[1] === '/') {
                    // 结束标签，这里需要抛出错误，因为它缺少与之对应的开始标签
                    console.error('无效的结束标签');
                    continue;
                } else if (/[a-z]/i.test(source[1])) {
                    // 标签
                    node = parseElement(context, ancestors);
                }
            } else if (source.startsWith('{{')) {
                // 插值
                node = parseInterpolation(context);
            }
        }

        // node 不存在，说明处于其他模式，即非 DATA 模式且非 RCDATA 模式
        // 这时一切内容都作为文本处理
        if (!node) {
            node = parseText(context);
        }

        nodes.push(node);
    }

    return nodes;
}


// parseElement 函数会做三件事：解析开始标签，解析子节点，解析结束标签
function parseElement(context: IContext, ancestors) {
    // 解析开始标签
    const element = parseTag(context);

    if (element.isSelfClosing) return element;
    ancestors.push(element);

    element.children = parseChildren(context, ancestors);
    ancestors.pop();

    if (context.source.startsWith(`</${element.tag}>`)) {
        parseTag(context, 'end');
    } else {
        console.log(`${element.tag} 标签缺少闭合标签`)
    }

    return element;
}

function isEnd(context: IContext, ancestors) {
    // 当模板内容解析完毕后，停止
    if (!context.source) return true

    // 与父级节点栈内所有节点做比较
    for (let i = ancestors.length - 1; i >= 0; --i) {
        // 只要栈中存在与当前结束标签同名的节点，就停止状态机
        if (context.source.startsWith(`</${ancestors[i].tag}>`)) {
            return true;
        }
    }
}