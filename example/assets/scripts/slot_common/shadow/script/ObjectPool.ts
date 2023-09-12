/**
 * 对象池
 * @author zengyong
 */
export default class ObjectPool {

    private static _list: any = {};

    static put(key: string, obj: any) {
        if (!ObjectPool._list[key])
            ObjectPool._list[key] = [];

        ObjectPool._list[key].push(obj);
    }

    static get(key): any {
        if (ObjectPool._list[key]) {
            var list = ObjectPool._list[key];
            if (list.length > 0)
                return list.shift();
        }
        return null;
    }

    static clear(key: string) {
        if (ObjectPool._list[key]) {
            var list: any[] = ObjectPool._list[key];
            for (var i = list.length - 1; i >= 0; i--)
                list[i] = null;
            ObjectPool._list[key] = null;
            delete ObjectPool._list[key];
        }
    }

    static clearAll() {
        for (var key in ObjectPool._list) {
            var list: any[] = ObjectPool._list[key];
            for (var i = list.length - 1; i >= 0; i--)
                list[i] = null;
            ObjectPool._list[key] = null;
            delete ObjectPool._list[key];
        }
    }
}