/*
Pager - 分页控件。
分页控件，配合表格控件使用，翻页时触发change事件，可在其中进行表格数据的更新。

分页控件直接HTML初始化的例子:
<div type="type:pager;pageSize:10;maxNum:40" class="ui-pager"></div>

属性
nPage:      当前的页码(从1开始记数)
nPageSize:  每页的记录数
nTotal:     总记录数

事件
change:     切换了分页

*/
(function () {

    var core = ecui,
        dom = core.dom,
        string = core.string,
        array = core.array,
        ui = core.ui,
        util = core.util,

        undefined,
        MATH = Math,

        createDom = dom.create,
        children = dom.children,
        extend = util.extend,
        blank = util.blank,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_PAGER = ui.Pager,
        UI_SELECT = ui.Select,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_PAGER_CLASS = UI_PAGER.prototype;
    /**
     * 初始化分页控件。
     * options 对象支持的属性如下：
     *      {Number} pageSize   每页的最大记录数
     *      {Number} total      记录总数 
     *      {Number} page      当前页码
     *
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_EXT_PAGER = ui.ExtPager =
        inheritsControl(
            UI_CONTROL,
            'ui-ext-pager',
            function (el, options) {
                var type = this.getTypes()[0],
                    i, len, html = [];
                
                html.push('<div class="'+ type +'-sum">共<em></em>条记录</div>');
                html.push('<div class="ui-pager"></div>');
                html.push('<div class="'+ type +'-pagesize"><span class="' + type + '-text">每页显示</span><select class="ui-select" style="width:40px">');
                for (i = 0, len = UI_EXT_PAGER.PAGE_SIZE.length; i < len; i++) {
                    html.push('<option value="'+ UI_EXT_PAGER.PAGE_SIZE[i] +'">' + UI_EXT_PAGER.PAGE_SIZE[i] + '</option>');
                }
                html.push('</select><span class="' + type + '-text">条</span>')
                el.innerHTML = html.join('');

                //处理pageSize
                options.pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
                for (i = 0, len = UI_EXT_PAGER.PAGE_SIZE.length; i < len; i++) {
                    if (UI_EXT_PAGER.PAGE_SIZE[i] == options.pageSize) {
                        break;
                    }
                }
                
                if (i >= len) {
                    options.pageSize = DEFAULT_PAGE_SIZE;
                }
            },
            function (el, options) {
                var el = children(el),
                    me = this;

                this._bResizable = false;
                this._eTotalNum = el[0].getElementsByTagName('em')[0];
                this._uPager = $fastCreate(UI_PAGER, el[1], this, extend({}, options));
                this._uPager.$change = function (value) {
                    triggerEvent(me, 'change', null, [value, me._uPager._nPageSize]);
                }
                this._uSelect = $fastCreate(UI_SELECT, el[2].getElementsByTagName('select')[0], this);
                this._uSelect.$change = function () {
                    triggerEvent(me, 'pagesizechange', null, [this.getValue()]);
                }
            }
        ),

        UI_EXT_PAGER_CLASS = UI_EXT_PAGER.prototype,

        DEFAULT_PAGE_SIZE = 50;
        

    UI_EXT_PAGER.PAGE_SIZE = [20, 50, 80];

    UI_EXT_PAGER_CLASS.init = function () {
        this._uPager.init();
        this._uSelect.init();
        this._eTotalNum.innerHTML = this._uPager._nTotal || 0;
        this._uSelect.setValue(this._uPager._nPageSize);
    }

    UI_EXT_PAGER_CLASS.render = function (page, total, pageSize) {
        var item = this._uPager;

        this._uSelect.setValue(pageSize);
        if (total || total == 0) {
            this._eTotalNum.innerHTML = total;
            item._nTotal = total
        }
        else {
            this._eTotalNum.innerHTML = item._nTotal || 0;
            item._nTotal = item._nTotal || 0;
        }
        item._nPageSize = pageSize || item._nPageSize;
        item.go(page);
    };

    UI_EXT_PAGER_CLASS.getPageSize = function () {
        return this._uPager._nPageSize;
    };

    UI_EXT_PAGER_CLASS.getPage = function () {
        return this._uPager._nPage;
    };

    UI_EXT_PAGER_CLASS.getTotal = function () {
        return this._uPager._nTotal;
    };
    
    /**
     * override
     */
    UI_EXT_PAGER_CLASS.$setSize = blank;

})();
