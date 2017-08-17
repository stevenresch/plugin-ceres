import ExceptionMap from "exceptions/ExceptionMap";

const ResourceService     = require("services/ResourceService");
const NotificationService = require("services/NotificationService");

Vue.component("add-to-basket", {

    props: [
        "item",
        "itemUrl",
        "showQuantity",
        "template",
        "useLargeScale",
        "showOrderProperties"
    ],

    data()
    {
        return {
            quantity: 1,
            buttonLockState: false
        };
    },

    created()
    {
        this.$options.template = this.template;

        this.useLargeScale = this.useLargeScale || false;
    },

    ready()
    {
        this.checkMinMaxOrderQuantity();
    },

    methods:
    {
        /**
         * add an item to basket-resource
         */
        addToBasket()
        {
            if (this.item.filter.isSalable)
            {
                const basketObject =
                    {
                        variationId             :   this.variationId,
                        quantity                :   this.quantity,
                        basketItemOrderParams   :   this.item.properties
                    };

                ResourceService.getResource("basketItems").push(basketObject)
                    .done(function()
                    {
                        this.openAddToBasketOverlay();
                    }
                    .bind(this))
                    .fail(function(response)
                    {
                        NotificationService.error(Translations.Template[ExceptionMap.get(response.data.exceptionCode.toString())]).closeAfter(5000);
                    });
            }
        },

        directToItem()
        {
            window.location.assign(this.itemUrl);
        },

        handleButtonState(value)
        {
            this.buttonLockState = value;
        },

        /**
         * open the AddItemToBasketOverlay
         */
        openAddToBasketOverlay()
        {
            const currentBasketObject =
                {
                    currentBasketItem: this.item,
                    quantity         : this.quantity
                };

            ResourceService
                .getResource("basketItem")
                .set(currentBasketObject);
        },

        /**
         * update the property quantity of the current instance
         * @param value
         */
        updateQuantity(value)
        {
            this.quantity = value;
        },

        /**
         * Check min - max order quantity
         */
        checkMinMaxOrderQuantity()
        {
            this.item.variation.minimumOrderQuantity = this.item.variation.minimumOrderQuantity === 0 || this.item.variation.minimumOrderQuantity === 1 ? null : this.item.variation.minimumOrderQuantity;
            this.item.variation.maximumOrderQuantity = this.item.variation.maximumOrderQuantity === 0 ? null : this.item.variation.maximumOrderQuantity;
        }
    },

    computed:
    {
        /**
         * returns item.variation.id
         */
        variationId()
        {
            return this.item.variation.id;
        },

        hasChildren()
        {
            return this.item.filter && this.item.filter.hasChildren && App.isCategoryView;
        }
    }
});
