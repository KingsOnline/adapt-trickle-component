define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var ButtonView = require("coreViews/buttonsView");
    var Adapt = require('coreJS/adapt');

    var trickleComponent = ComponentView.extend({

        events: {
            "click .btn-html-trickle": "advanceStage"
        },

        preRender: function() {
            // Checks to see if the text should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        render: function() {

            var data = this.model.toJSON();
            var templateMain = Handlebars.templates["html"];
            this.$el.html(templateMain(data));

            var tplName = this.model.get("_template");
            var $stages = this.model.get("_items").length;

            this.loadTrickle($stages)
            var $container = this.$(".component-inner");

            this.postRender();
        },

        postRender: function() {
            this.setReadyStatus();


            if (this.model.get("_isClickme")) {
                setTimeout(function() {
                    this.$(".clickme").offset(this.$(".clickme-item").eq(0).offset());
                }.bind(this), 0);
            }

            // Load script if present

            this.$el.on("complete", _.bind(this.onCompleted, this));

            //Check if complete
            if (this.model.get("_isComplete")) {
                this.$el.addClass("complete");
            }

            if (this.model.get("_scripts")) {
                _.each(this.model.get("_scripts"), function(fileName) {

                    var script = document.createElement("script");
                    script.src = "course/en/scripts/" + fileName;
                    document.head.appendChild(script);
                }, this);
            }
        },

        loadTrickle: function($stages) {
            this.model.set("stage", 0);
            this.model.set("numStages", $stages.length);
            this.model.set("_isTrickle", true);
            this.$(".trickle-item").addClass("trickle-item-hidden");
            console.log($(".trickle-item"));
        },

        advanceStage: function() {
            var stage = this.model.get("stage");
            var $el = this.$(".trickle-item").eq(stage);
            $el.reveal();

            if (stage === 0) {
                var h = this.$(".btn-html-trickle").outerHeight();
                console.log(h);
                // this.$(".html-button").height(h);
            }

            if (stage + 1 >= this.model.get("_items").length) {
                this.onCompleted();
                setTimeout(function() {
                    this.$(".html-button").height(0);
                }.bind(this), 200);
            } else {
                this.model.set("stage", stage + 1);
            }
        },

        onCompleted: function() {
            this.$(".component-inner").parent().addClass("complete");
            this.setCompletionStatus();
        },

        // Used to check if the text should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        }
    });

    Adapt.register('trickleComponent', trickleComponent);
    return trickleComponent;
});

$.fn.extend({
    reveal: function() {
        var $children = this.children();
        var h = 0;
        _.each($children, function(el) {
            h += $(el).outerHeight(true);
        });
        var isBlockslider = this.parents(".blockslider").length > 0;
        if (isBlockslider) {
            var $elScroll = this.parents(".block");
            var st = $elScroll.scrollTop();
        } else {
            var $elScroll = $("body, html");
            var st = $elScroll.eq(0).scrollTop();
            if (!st) st = $elScroll.eq(1).scrollTop();
        }

        var top = this.offset().top;
        var winHeight = $(window).height();
        if (st + winHeight - 100 < top + h) $elScroll.animate({
            scrollTop: "+=" + h
        });
        this.height(h).trigger("reveal");
        setTimeout(function() {
            this.height("auto");
            $(this).removeClass('trickle-item-hidden');
        }.bind(this), 500);
        return this;
    }
});
