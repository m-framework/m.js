if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.drag_sortable = function() {

    var
        container = this,
        elements,
        drag_element,
        sequence,
        has_move_element = false,
        isHandle = false,
        group_id = container.attr('data-m-group'),
        model  = container.attr('data-m-model'),
        init_elements = function(){
            elements = container.find('[data-id]');

            elements.each(function(){

                if (m(this).find('i.move').length > 0) {
                    has_move_element = true;
                    this.setAttribute('draggable', 'false');
                }
                else {
                    this.setAttribute('draggable', 'true');
                }
            });
        },



        click_item = null,
        drag_item = null,
        hover_item = null,
        sort_lists = [],
        click_point = {},
        dragging  = false,
        toArray = function( attr )
        {
            attr = attr || "data-id";

            var
                sequence = {},
                data = [],
                item = null,
                uniq = "";

            console.log(container);
            console.log(container.first);

            for(var i = 0; i < container.first.children.length; ++i){
                item = container.first.children[i],
                    uniq = item.getAttribute( attr ) || "";

                uniq = uniq.replace( /[^0-9]+/gi, "" );

                sequence[uniq] = (i + 1) * 10;

                data.push( uniq );
            }

            return sequence;
        },

        // checks if mouse x/y is on top of an item
        isOnTop = function( item, x, y )
        {
            var box = item.getBoundingClientRect(),
                isx = ( x > box.left && x < ( box.left + box.width ) ),
                isy = ( y > box.top && y < ( box.top + box.height ) );

            return ( isx && isy );
        },

        // swap position of two item in sortable list container
        swapItems = function( item1, item2 )
        {
            var parent1 = item1.parentNode,
                parent2 = item2.parentNode;

            if( parent1 !== parent2 )
            {
                // move to new list
                parent2.insertBefore( item1, item2 );
            }
            else {
                // sort is same list
                var temp = document.createElement( "div" );
                parent1.insertBefore( temp, item1 );
                parent2.insertBefore( item1, item2 );
                parent1.insertBefore( item2, temp );
                parent1.removeChild( temp );
            }
        },

        // update item position
        moveItem = function( item, x, y )
        {
            item.style["-webkit-transform"] = "translateX( "+ x +"px ) translateY( "+ y +"px )";
            item.style["-moz-transform"] = "translateX( "+ x +"px ) translateY( "+ y +"px )";
            item.style["-ms-transform"] = "translateX( "+ x +"px ) translateY( "+ y +"px )";
            item.style["transform"] = "translateX( "+ x +"px ) translateY( "+ y +"px )";
        },

        // make a temp fake item for dragging and add to container
        makeDragItem = function( item )
        {
            trashDragItem.call(this);
            sort_lists = m('[data-is-sortable]');

            click_item = item;
            m(item).class('active', true);

            drag_item = document.createElement( item.tagName );
            drag_item.className = "dragging";
            drag_item.innerHTML = item.innerHTML;
            drag_item.style["position"] = "absolute";
            drag_item.style["z-index"] = "999";
            drag_item.style["left"] = ( item.offsetLeft || 0 ) + "px";
            drag_item.style["top"] = ( item.offsetTop || 0 ) + "px";
            drag_item.style["width"] = ( item.offsetWidth || 0 ) + "px";

            container.append(drag_item);
        },

        // remove drag item that was added to container
        trashDragItem = function()
        {
            if( drag_item && click_item )
            {
                m(this).class('active', null);
                click_item = null;

                drag_item.parentNode.removeChild(drag_item);
                drag_item = null;

                save_sequence();
            }
        },

        save_sequence = function() {

            m.ajax({
                url: '/ajax',
                data: {
                    action: '_update_sequence',
                    model: model,
                    sequence: toArray(),
                    group: group_id
                }
            });
        },

        // on item press/drag
        onPress = function( e )
        {
            var m_this = m(this);
            if(m_this.closest('[data-m-action="drag_sortable"]').first === container.first) {

                e.preventDefault();

                dragging = true;
                click_point = getPoint(e);
                makeDragItem(this);
                onMove.call(this, e);
            }
        },

        // on item release/drop
        onRelease = function( e )
        {
            dragging = false;
            trashDragItem.call(this);
        },

        // on item drag/move
        onMove = function( e )
        {
            if(drag_item && dragging)
            {
                e.preventDefault();

                var point     = getPoint( e );

                // drag fake item
                moveItem.call(drag_item, drag_item, ( point.x - click_point.x ), ( point.y - click_point.y ) );

                // keep an eye for other sortable lists and switch over to it on hover
                for( var a = 0; a < sort_lists.length; ++a )
                {
                    var subContainer = sort_lists.nth(a);

                    if(isOnTop.call(this, subContainer, point.x, point.y))
                    {
                        container = m(subContainer);
                    }
                }

                // container is empty, move clicked item over to it on hover
                if(isOnTop.call(drag_item, container.first, point.x, point.y ) && container.children.length === 0 )
                {
                    container.appendChild( click_item );
                    return;
                }

                // check if current drag item is over another item and swap places
                for( var b = 0; b < container.length; ++b )
                {
                    var subItem = container.nth(b);

                    if( subItem === click_item || subItem === drag_item )
                    {
                        continue;
                    }
                    if(isOnTop.call(drag_item, subItem, point.x, point.y ) )
                    {
                        hover_item = subItem;  // ??
                        swapItems( click_item, subItem );
                    }
                }
            }
        },
        getPoint = function(e)
        {
            var
                _w = window,
                _b = document.body,
                _d = document.documentElement,
                scrollX = Math.max(0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0 ) - ( _d.clientLeft || 0),
                scrollY = Math.max(0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0 ) - ( _d.clientTop || 0),
                pointX  = e ? (Math.max(0, e.pageX || e.clientX || 0 ) - scrollX ) : 0,
                pointY  = e ? (Math.max(0, e.pageY || e.clientY || 0 ) - scrollY ) : 0;

            return {x: pointX, y: pointY};
        };

    init_elements();

    container.attr('data-is-sortable', 1);
    container.css({position: 'static'});

//console.log(elements);

    elements.each(function(){
        m(this)
            .off('mousedown touchstart', onPress)
            .on('mousedown touchstart', onPress);
    });

    container.on('mouseup', onRelease);
    container.on('touchend', onRelease);
    m(window).on('mousemove', onMove);
    m(window).on('touchmove', onMove);

};
