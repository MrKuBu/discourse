import computed from "ember-addons/ember-computed-decorators";
import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Ember.Controller.extend({
  sortProperties: ["totalCount:desc", "id"],
  sortedByCount: true,
  sortedByName: false,

  canAdminTags: Ember.computed.alias("currentUser.staff"),
  groupedByCategory: Ember.computed.notEmpty("model.extras.categories"),
  groupedByTagGroup: Ember.computed.notEmpty("model.extras.tag_groups"),

  @computed("groupedByCategory", "groupedByTagGroup")
  otherTagsTitleKey(groupedByCategory, groupedByTagGroup) {
    if (!groupedByCategory && !groupedByTagGroup) {
      return "tagging.all_tags";
    } else {
      return "tagging.other_tags";
    }
  },

  actions: {
    sortByCount() {
      this.setProperties({
        sortProperties: ["totalCount:desc", "id"],
        sortedByCount: true,
        sortedByName: false
      });
    },

    sortById() {
      this.setProperties({
        sortProperties: ["id"],
        sortedByCount: false,
        sortedByName: true
      });
    },

    showUploader() {
      showModal("tag-upload");
    },

    deleteUnused() {
      ajax("/tags/unused", { type: "GET" })
        .then(result => {
          bootbox.confirm(
            I18n.t("tagging.delete_unused_confirmation", {
              count: result.count
            }),
            I18n.t("tagging.cancel_delete_unused"),
            I18n.t("tagging.delete_unused"),
            proceed => {
              if (proceed) {
                ajax("/tags/unused", { type: "DELETE" })
                  .then(() => {
                    this.send("refresh");
                  })
                  .catch(popupAjaxError);
              }
            }
          );
        })
        .catch(popupAjaxError);
    }
  }
});
