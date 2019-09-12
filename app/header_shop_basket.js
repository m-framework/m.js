/**
 * A module "shop_basket" for m.js JavaScript Library v1.1
 * Details: https://m-framework.com/js/modules/shop_basket
 *
 * Copyright 2017 m-framework.com
 * Released under the MIT license
 * https://m-framework.com/js/license
 *
 * Author: mrinmiro@gmail.com
 *
 * Date: 2018-04-04T02:17Z
 */
if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.header_shop_basket = function(basket) {

    var
        order_amount_container = basket.find('.order-amount'),
        basket_order = basket.next('.basket-order'),
        order_total_span = basket.find('span.order-total'),
        products_container = basket_order.find('.order-products'),
        order_total_container = basket_order.find('.order-total'),
        basket_icon = basket.find('.fa.fa-shopping-basket'),
        buy_buttons = m('document').find('.product[data-id] .buy-button'),
        scroll2 = function(callback) {

            var scroll_elem = parseInt(m('document').first.scrollTop) == 0
                    && parseInt(m('body').first.scrollTop) !== 0 ? m('body') : m('document');

            scroll_elem.animate({
                scrollTop: scroll_elem.first.scrollTop + basket.first.getBoundingClientRect().top - 50
            }, 300, callback);
        },
        change_quantity_in_basket = function(product_id, quantity){
            m.ajax({
                url: '/order',
                data: {
                    action: '_ajax_change_quantity_in_basket',
                    product: product_id,
                    count: quantity
                },
                success: apply_data
            });
        },
        products_count_init = function(){
            products_container
                .find('input[type="number"]')
                .off('change')
                .on('change', function(e){
                    var product_id = m(this).closest('.order-product[data-id]').attr('data-id');
                    change_quantity_in_basket(product_id, m(this).val());
                });

            products_container
                .find('input[type="number"] + a.delete')
                .off('click')
                .on('click', function(e){
                    e.preventDefault();
                    var product_id = m(this).closest('.order-product[data-id]').attr('data-id');
                    change_quantity_in_basket(product_id, 0);
                });
        },
        apply_data = function(data) {

            if (typeof data.products !== 'undefined') {
                products_container.html(data.products);
                products_count_init();
            }

            if (typeof data.order_amount !== 'undefined') {
                order_amount_container
                    .html(data.order_amount)
                    .class({hidden: parseInt(data.order_amount) === 0 ? true : null});
            }

            if (typeof data.order_total !== 'undefined') {
                order_total_container.html(data.order_total);
                order_total_span.html(data.order_total);
            }

            scroll2(function(){

                if (typeof data.order_total === 'undefined' || parseInt(data.order_total) === 0) {
                    return false;
                }

                basket_icon.class({swing: true});
                window.setTimeout(function(){
                    basket_icon.class({swing: null});
                }, 3000);
            });
        };

    buy_buttons.off('click').on('click', function(e){
        e.preventDefault();

        var product_id = m(this).closest('.product[data-id]').attr('data-id');

        m.ajax({
            url: '/order',
            data: {
                action: '_ajax_add_to_basket',
                product: product_id
            },
            success: function(response){
                apply_data(response);
                basket.class({active: true});
            }
        });
    });

    basket.off('click').on('click', function(e) {

        if (e.target == basket.first || e.target == basket_icon.first || e.target == order_amount_container.first
            || e.target == order_total_span.first) {
            e.preventDefault();
            basket.class({active: ':toggle'});
        }
    });

    products_count_init();

    m.ajax({
        url: '/order',
        data: {
            action: '_ajax_basket_data'
        },
        success: apply_data
    });
};