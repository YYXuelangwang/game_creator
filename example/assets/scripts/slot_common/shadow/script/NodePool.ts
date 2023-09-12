/**
 * 节点对象池
 * @author zengyong
 */
export default class NodePool {

    private static _list: any = {};

    /**
     * 存入对象池
     * @param key 标识
     * @param node 节点
     */
    static put(key: string, node: cc.Node) {
        if (!NodePool._list[key])
            NodePool._list[key] = [];
            
        NodePool._list[key].push(node);
    }

    /**
     * 从对象池取出
     * @param key 标识
     */
    static get(key): cc.Node {
        if (NodePool._list[key]) {
            var list: cc.Node[] = NodePool._list[key];
            if (list.length > 0) {
                var node: cc.Node = list.shift();
                return node;
            }
        }
        return null;
    }

    /**
     * 清理
     * @param key 标识
     */
    static clear(key: string) {
        if (NodePool._list[key]) {
            var list: cc.Node[] = NodePool._list[key];
            for (var i = list.length - 1; i >= 0; i--) {
                var node: cc.Node = list[i];
                node.destroy();
            }
            NodePool._list[key] = null;
            delete NodePool._list[key];
        }
    }

    /**
     * 清理所有
     */
    static clearAll() {
        for (var key in NodePool._list) {
            var list: cc.Node[] = NodePool._list[key];
            for (var i = list.length - 1; i >= 0; i--) {
                var node: cc.Node = list[i];
                node.destroy();
                node = undefined;
            }
            NodePool._list[key] = undefined;
            delete NodePool._list[key];
        }
    }
}