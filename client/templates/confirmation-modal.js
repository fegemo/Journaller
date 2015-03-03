/**
 * Created by fegemo on 3/3/15.
 */

Template.confirmationModal.helpers();

Template.confirmationModal.events({
  'click .modal-yes': function (e, template) {
    debugger;
    this.callback(1, true);
  }
});