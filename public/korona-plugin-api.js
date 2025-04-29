/**
 * COMBASE KORONA.pos Client - Plugin API - JavaScript module Version 1.0.0
 */
korona_plugin_api = new function() {

    this.response = new function() {

        this.actions = [];

        this.application = { key: null, version: null };

        this.modified = function(handler) {
            if (typeof handler === 'function')
                this.modified.notify = handler;
            return this.modified;
        };
        this.modified.notify = function() {};

        this.identifyAs = function(key, version) {
            this.application.key = key;
            this.application.version = version;
            this.modified.notify();
            return this;
        };

        this.startActions = function() {
            this.actions = [];
            this.modified.notify();
            return this;
        };

        this.removeAction = function(paramObj) {
            if (typeof paramObj === 'undefined')
                return this;
            if (typeof paramObj !== 'number')
                this.removeAction(this.actions.indexOf(paramObj));
            if (paramObj < 0 || paramObj >= this.actions.length)
                return this;
            this.actions.splice(paramObj, 1);
            this.modified.notify();
            return this;
        }

		 this.cancelVoucher = function(paramObj) {
            this.actions.push({
                type: 'cancelVoucherAction',
                uid: paramObj.uid
            });
            this.modified.notify();
            return this;
        };

        this.openReceiptByOrderNumber = function(paramObj) {
            this.actions.push({
                type: 'openReceiptByOrderNumberAction',
                orderNumber: paramObj.orderNumber
            });
            this.modified.notify();
            return this;
        };

        this.addVoucherTransaction = function(paramObj) {
            this.actions.push({
                type: 'addVoucherTransactionAction',
                voucherDefinitionNumber: paramObj.voucherDefinitionNumber,
                balance: paramObj.balance,
                customReferences: paramObj.customReferences,
                voucherNumber: paramObj.voucherNumber,
                productionState: paramObj.productionState,
                uid: paramObj.uid
            });
            this.modified.notify();
            return this;
        };


        this.addAccountTransaction = function(paramObj) {
            this.actions.push({
                type: 'addAccountTransactionAction',
                accountNumber: paramObj.accountNumber,
                amount: paramObj.amount,
                description: paramObj.description,
                fixedAmount: paramObj.fixedAmount,
                infoTexts: paramObj.infoTexts,
                notRemovable: paramObj.notRemovable,
                customData: paramObj.customData,
                serialNumbers: paramObj.serialNumbers,
                customReferences: paramObj.customReferences
            });
            this.modified.notify();
            return this;
        };

        this.addPayment = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { inputAmount: paramObj };
            this.actions.push({
                type: 'addPaymentAction',
                inputAmount: paramObj.inputAmount,
                paymentMethodNumber: paramObj.paymentMethodNumber,
                customData: paramObj.customData,
                balanceInfo: paramObj.balanceInfo,
                paymentCardInformation: paramObj.paymentCardInformation,
                customReferences: paramObj.customReferences,
                notRemovable: paramObj.notRemovable,
            });
            this.modified.notify();
            return this;
        };

        this.addSale = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { recognitionCode: paramObj };
            this.actions.push({
                type: 'addSaleAction',
                description: paramObj.description,
                discount: this.createDiscountAction(paramObj.discount),
                infoTexts: paramObj.infoTexts,
                notRemovable: paramObj.notRemovable,
                price: paramObj.price,
                quantity: paramObj.quantity,
                recognitionCode: paramObj.recognitionCode,
                useAlternativeSector: paramObj.useAlternativeSector,
                customData: paramObj.customData,
                serialNumbers: paramObj.serialNumbers,
                productTemplate: paramObj.productTemplate,
                ticketDefinition: this.createTicketDefinitionAction(paramObj.ticketDefinition),
                customReferences: paramObj.customReferences,
                productionState: paramObj.productionState,
                returnReason: paramObj.returnReason,
                discountable: paramObj.discountable,
                respectSalesLock: paramObj.respectSalesLock,
                bundledSales:paramObj.bundledSales,
                bundledSalesReplacingSubProducts: paramObj.bundledSalesReplacingSubProducts,
                hideQuantity: paramObj.hideQuantity,
                userInteractionEnabled: paramObj.userInteractionEnabled
            });
            this.modified.notify();
            return this;
        };

        this.addCouponItem = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { number: paramObj };
            this.actions.push({
                type: 'addCouponItemAction',
                number: paramObj.number,
                discountCreditBalance: paramObj.discountCreditBalance
            });
            this.modified.notify();
            return this;
        };

        this.removeCouponItems = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { number: paramObj };
            this.actions.push({
                type: 'removeCouponItemsAction',
                number: paramObj.number
            });
            this.modified.notify();
            return this;
        };

        this.displayMessage = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { text: paramObj };
            this.actions.push({
                type: 'displayMessageAction',
                level: paramObj.level,
                text: paramObj.text,
                title: paramObj.title
            });
            this.modified.notify();
            return this;
        };

        this.logJournal = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { text: paramObj };
            this.actions.push({
                type: 'logJournalAction',
                level: paramObj.level,
                text: paramObj.text
            });
            this.modified.notify();
            return this;
        };

        this.logMessage = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { text: paramObj };
            this.actions.push({
                type: 'logMessageAction',
                level: paramObj.level,
                text: paramObj.text
            });
            this.modified.notify();
            return this;
        };

        this.modifyAccountTransaction = function(paramObj) {
            this.actions.push({
                type: 'modifyAccountTransactionAction',
                modifier: paramObj.modifier,
                amount: paramObj.amount,
                fixedAmount: paramObj.fixedAmount,
                infoTexts: paramObj.infoTexts,
                notRemovable: paramObj.notRemovable,
                customData: paramObj.customData,
                serialNumbers: paramObj.serialNumbers,
                customReferences: paramObj.customReferences
            });
            this.modified.notify();
            return this;
        };

        this.modifyPayment = function(paramObj) {
            this.actions.push({
                type: 'modifyPaymentAction',
                modifier: paramObj.modifier,
                customData: paramObj.customData,
                customReferences: paramObj.customReferences
            });
            this.modified.notify();
            return this;
        };

        this.modifySale = function(paramObj) {
            this.actions.push({
                type: 'modifySaleAction',
                modifier: paramObj.modifier,
                discount: this.createDiscountAction(paramObj.discount),
                infoTexts: paramObj.infoTexts,
                price: paramObj.price,
                quantity: paramObj.quantity,
                useAlternativeSector: paramObj.useAlternativeSector,
                serialNumbers: paramObj.serialNumbers,
                customData: paramObj.customData,
                ticketDefinition: this.createTicketDefinitionAction(paramObj.ticketDefinition),
                customReferences: paramObj.customReferences,
                productionState: paramObj.productionState,
                returnReason: paramObj.returnReason,
                discountable: paramObj.discountable,
                hideQuantity: paramObj.hideQuantity,
            });
            this.modified.notify();
            return this;
        };

        this.printMessage = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { text: paramObj };
            this.actions.push({
                type: 'printMessageAction',
                text: paramObj.text,
                lines: paramObj.lines,
                title: paramObj.title,
                qrCode: paramObj.qrCode,
                code39Barcode: paramObj.code39Barcode,
                barcode: paramObj.barcode,
                printFooter: paramObj.printFooter,
                printHeader: paramObj.printHeader
            });
            this.modified.notify();
            return this;
        };

        this.produceDirect = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { customerGroupNumber: paramObj }
            this.actions.push({
                type: 'produceDirectAction',
                customerGroupNumber: paramObj.customerGroupNumber,
                customer: paramObj.customer,
                customData: paramObj.customData,
                customReferences: paramObj.customReferences,
                infoTexts: paramObj.infoTexts,
                accountTransactions: paramObj.accountTransactions,
                sales: paramObj.sales
            });
            this.modified.notify();
            return this;
        };

        this.removeReceiptItem = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { modifier: parseInt(paramObj) };
            else if (typeof paramObj === 'number')
                paramObj = { modifier: paramObj | 0 };
            this.actions.push({
                type: 'removeReceiptItemAction',
                modifier: paramObj.modifier
            });
            this.modified.notify();
            return this;
        };

        this.setInputLine = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { value: paramObj };
            this.actions.push({
                type: 'setInputLineAction',
                value: paramObj.value
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptCustomer = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { number: paramObj };
            this.actions.push({
                type: 'setReceiptCustomerAction',
                customer: {
                    address: this.createAddress(paramObj.address),
                    alternativePhone: paramObj.alternativePhone,
                    birthday: paramObj.birthday,
                    company: paramObj.company,
                    email: paramObj.email,
                    fax: paramObj.fax,
                    firstName: paramObj.firstName,
                    gender: paramObj.gender,
                    lastName: paramObj.lastName,
                    number: paramObj.number,
                    phone: paramObj.phone,
                    salutation: paramObj.salutation,
                    title: paramObj.title
                }
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptFinishBlockingIndicator = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { message: paramObj };
            this.actions.push({
                type: 'setReceiptFinishBlockingIndicatorAction',
                blockingIndicator: paramObj
            });
            this.modified.notify();
            return this;
        };

        this.unsetReceiptFinishBlockingIndicator = function() {
            this.actions.push({
                type: 'setReceiptFinishBlockingIndicatorAction',
                message: null
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptPaymentBlockingIndicator = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { message: paramObj };
            this.actions.push({
                type: 'setReceiptPaymentBlockingIndicatorAction',
                blockingIndicator: paramObj
            });
            this.modified.notify();
            return this;
        };

        this.unsetReceiptPaymentBlockingIndicator = function() {
            this.actions.push({
                type: 'setReceiptPaymentBlockingIndicatorAction',
                message: null
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptCustomerGroup = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { customerGroupNumber: paramObj };
            this.actions.push({
                type: 'setReceiptCustomerGroupAction',
                customerGroupNumber: paramObj.customerGroupNumber
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptDiscount = function(paramObj) {
            this.actions.push({
                type: 'modifyReceiptAction',
                discount: this.createDiscountAction(paramObj)
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptInfotexts = function(paramObj) {
            if (typeof paramObj === 'string') {
                paramObj = { infoTexts: [paramObj] };
            }
            this.actions.push({
                type: 'modifyReceiptAction',
                infoTexts: paramObj.infoTexts
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptCustomData = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { customData: paramObj };
            this.actions.push({
                type: 'modifyReceiptAction',
                customData: paramObj.customData
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptLoyaltyCardNumber = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { loyaltyCardNumber: paramObj };
            this.actions.push({
                type: 'modifyReceiptAction',
                loyaltyCardNumber: paramObj.loyaltyCardNumber
            });
            this.modified.notify();
            return this;
        };

        this.setAdditionalReceiptInfo = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { additionalReceiptInfoTypeNumber: paramObj };
            this.actions.push({
                type: 'setAdditionalReceiptInfoAction',
                additionalReceiptInfoTypeNumber: paramObj.additionalReceiptInfoTypeNumber,
                info: paramObj.info
            });
            this.modified.notify();
            return this;
        };

        this.callExternalSystem = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { displayUrl: paramObj };
            this.actions.push({
                type: 'callExternalSystemAction',
                displayUrl: paramObj.displayUrl,
                displayUrlPost: paramObj.displayUrlPost,
                systemUrl: paramObj.systemUrl,
                login: paramObj.login,
                password: paramObj.password,
                connectTimeoutMillis: paramObj.connectTimeoutMillis,
                readTimeoutMillis: paramObj.readTimeoutMillis
            });
            this.modified.notify();
            return this;
        };

        this.callExternalSystemByNumber = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { externalSystemNumber: paramObj };
            this.actions.push({
                type: 'callExternalSystemByNumberAction',
                externalSystemNumber: paramObj.externalSystemNumber
            });
            this.modified.notify();
            return this;
        };

        this.unsetReceiptCustomer = function() {
            this.actions.push({
                type: 'setReceiptCustomerAction',
                customer: null
            });
            this.modified.notify();
            return this;
        };

        this.unsetReceiptCustomerGroup = function() {
            this.actions.push({
                type: 'setReceiptCustomerGroupAction',
                customerGroupNumber: null
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptOrderNumber = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { orderNumber: paramObj };
            this.actions.push({
                type: 'setReceiptOrderNumberAction',
                orderNumber: paramObj.orderNumber
            });
            this.modified.notify();
            return this;
        };


        this.addReceiptProductionFinalizationCall = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { id: paramObj, systemUrl: paramObj };
            if (typeof paramObj.failurePrintMessage === 'string')
            	paramObj.failurePrintMessage = {
                	type: 'printMessageAction',
                	text: paramObj.failurePrintMessage
                };
            this.actions.push({
                type: 'addReceiptProductionFinalizationCallAction',
                id: paramObj.id,
                failureUserDisplayMessage: paramObj.failureUserDisplayMessage,
                failurePrintMessage: paramObj.failurePrintMessage,
                connectTimeoutMillis: paramObj.connectTimeoutMillis,
                login: paramObj.login,
                password: paramObj.password,
                readTimeoutMillis: paramObj.readTimeoutMillis,
                systemUrl: paramObj.systemUrl,
                continueOnFailure: paramObj.continueOnFailure
            });
            this.modified.notify();
            return this;
        };


        this.removeReceiptProductionFinalizationCall = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { id: paramObj };
            this.actions.push({
                type: 'removeReceiptProductionFinalizationCallAction',
                id: paramObj.id
            });
            this.modified.notify();
            return this;
        };


        this.showWebPage = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { displayUrl: paramObj };
            this.actions.push({
                type: 'showWebPageAction',
                displayUrl: paramObj.displayUrl,
                customerDisplayUrl: paramObj.customerDisplayUrl, // deprecated!
                displayUrlPost: paramObj.displayUrlPost,
                login: paramObj.login,
                password: paramObj.password
            });
            this.modified.notify();
            return this;
        };

        this.setCustomerDisplayMediaUrl = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { mediaUrl: paramObj };
            this.actions.push({
                type: 'setCustomerDisplayMediaUrlAction',
                mediaUrl: paramObj.mediaUrl
            });
            this.modified.notify();
            return this;
        };

        this.showButtons = function(paramObj) {
            if (typeof paramObj === 'string')
                paramObj = { buttonLayoutNumber: paramObj };
            else if (Array.isArray(paramObj))
                paramObj = { buttons: paramObj };
            this.actions.push({
                type: 'showButtonsAction',
                title: paramObj.title,
                buttons: paramObj.buttons,
                buttonLayoutNumber: paramObj.buttonLayoutNumber
            });
            this.modified.notify();
            return this;
        };

        this.switchButtonBadges = function(paramObj) {
            if (Array.isArray(paramObj))
                paramObj = { badges: paramObj };
            this.actions.push({
                type: 'switchButtonBadgesAction',
                badges: paramObj.badges
            });
            this.modified.notify();
            return this;
        };

        this.syncMasterData = function() {
            this.actions.push({
                type: 'syncMasterDataAction'
            });
            this.modified.notify();
            return this;
        };

        this.performEndOfDay = function(paramObj) {
            this.actions.push({
                type: 'performEndOfDayAction',
                requiredZcounter: paramObj.requiredZcounter,
                forceEvenIfAutomaticEndOfDayIsActivated: paramObj.forceEvenIfAutomaticEndOfDayIsActivated
            });
            this.modified.notify();
            return this;
        };

        this.runFiscalizationSetup = function() {
            this.actions.push({
                type: 'runFiscalizationSetupAction'
            });
            this.modified.notify();
            return this;
        };

        this.clearCurrentReceipt = function() {
            this.actions.push({
                type: 'clearCurrentReceiptAction'
            });
            this.modified.notify();
            return this;
        };

        this.forcePrinting = function(paramObj) {
            this.actions.push({
                type: 'modifyReceiptAction',
                forcePrinting: paramObj.forcePrinting
            });
            this.modified.notify();
            return this;
        };

        this.setReceiptDeactivatedCouponingCampaignNumbers = function(paramObj) {
            this.actions.push({
                type: 'modifyReceiptAction',
                deactivatedCouponingCampaignNumbers: paramObj
            });
            this.modified.notify();
            return this;
        };

        this.createAddress = function(paramObj) {
            if (typeof paramObj === 'undefined' || paramObj === null)
                return undefined;
            return {
                city: paramObj.city,
                country: paramObj.country,
                line1: paramObj.line1,
                line2: paramObj.line2,
                postalCode: paramObj.postalCode,
                state: paramObj.state
            };
        };

        this.createDiscountAction = function(paramObj) {
            if (typeof paramObj === 'undefined' || paramObj === null)
                return undefined;
            if (typeof paramObj === 'number')
                return {
                    amount: paramObj,
                    percent: false,
                    portion: paramObj.portion
                };
            else if (typeof paramObj.percent === 'number')
                return {
                    amount: paramObj.percent,
                    percent: true,
                    portion: paramObj.portion
                };
            return {
                amount: paramObj.amount,
                percent: paramObj.percent,
                portion: paramObj.portion
            };
        };

        this.createTicketDefinitionAction = function(paramObj) {
            if (typeof paramObj === 'undefined' || paramObj === null)
                return undefined;
            if (typeof paramObj === 'boolean')
                paramObj = { mergedTicketPrintout: paramObj };
            return {
                categoryName: paramObj.categoryName,
                printCopies: paramObj.printCopies,
                mergedTicketPrintout: paramObj.mergedTicketPrintout,
                infoTexts: paramObj.infoTexts,
                eventInfo: paramObj.eventInfo,
                ticketValidityDescription: paramObj.ticketValidityDescription,
                printOnly: paramObj.printOnly
            };
        };

        this.createFormattedLine = function(paramObj) {
            if (typeof paramObj === 'undefined' || paramObj === null)
                return undefined;
            if (typeof paramObj === 'string')
                paramObj = { text: paramObj };
            return {
                text: paramObj.text,
                fontSize: paramObj.fontSize,
                fontWeight: paramObj.fontWeight,
                code39Barcode: paramObj.code39Barcode,
                barcode: paramObj.barcode,
                qrCode: paramObj.qrCode
            };
        };

        this.createButton = function(paramObj) {
            if (typeof paramObj === 'undefined' || paramObj === null)
                return undefined;
            if (typeof paramObj === 'string')
                paramObj = { label: paramObj };
            return {
                label: paramObj.label,
                column: paramObj.column,
                row: paramObj.row,
                actions: paramObj.actions,
                color: paramObj.color,
                fontSize: paramObj.fontSize,
                layout: paramObj.layout
            };
        };

        this.createButtonBadge = function(paramObj) {
            if (typeof paramObj === 'undefined' || paramObj === null)
                return undefined;
            if (typeof paramObj === 'string')
                paramObj = { productTags: [paramObj] };
            else if (Array.isArray(paramObj))
                paramObj = { productTags: paramObj };
            return {
                color: paramObj.color,
                productTags: paramObj.productTags
            };
        };

        this.toJson = function() {
            return JSON.stringify(this);
        };
    };

    this.request = null;

    this.ready = function(handler) {
        if (typeof handler === 'function')
            this.ready.notify = handler;
        return this.ready;
    };
    this.ready.notify = function() {};


    this.init = function(request) {
        this.request = request;
        this.ready.notify();
    };

    this.initFromJson = function(json_string) {

        this.init(JSON.parse(json_string));
    };

    this.backToKorona = function() {
        window.close();
    };

    this.showOsk = function() {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.showOsk();
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.showOsk();
        }
    };

    this.hideOsk = function() {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.hideOsk();
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.hideOsk();
        }
    };

    this.trace = function(message) {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.trace(message);
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.trace(message);
        }
    };

    this.debug = function(message) {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.debug(message);
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.debug(message);
        }
    };

    this.info = function(message) {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.info(message);
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.info(message);
        }
    };

    this.warn = function(message) {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.warn(message);
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.warn(message);
        }
    };

    this.error = function(message) {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.error(message);
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.error(message);
        }
    };

    this.alert = function(message) {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.alert(message);
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.alert(message);
        }
    };


    this.closeCustomerDisplayCall = function() {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.closeCustomerDisplayCall();
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.closeCustomerDisplayCall();
        }
    }


    this.performActions = function() {
        if (window && window.self !== window.top && window.parent) {
            window.parent.korona_plugin_api.performActions();
        } else {
            if (typeof this.bridge === 'undefined')
                return;
            this.bridge.performActions(window.btoa(encodeURIComponent(JSON.stringify(korona_plugin_api.response))));
            this.response.startActions();
        }
    }
};


if (window) {
    if (window.self !== window.top && window.parent) {
        // signal the parent that we're loaded.
        window.parent.postMessage("loaded", "*");

        window.addEventListener('message', function(event) {
            // console.log('parentFrame sent:  ' + event.data);
            korona_plugin_api.initFromJson(event.data);
        }, false);

        //override window.close()
        window.close = function() {
            // signal the parent that we're finished.
            window.parent.postMessage("closed", "*");
        };
    }
}


// module.exports = korona_plugin_api;
