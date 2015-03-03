/**
 * Created by fegemo on 2/25/15.
 */

Session.setDefault('columnsShown', 1);

Template.entryList.helpers({
  columnsShown: function() {
    return Session.get('columnsShown');
  },
  // regions
  regions: function() {
    return Regions.find({}, {sort: {name: 1}});
  },
  activeRegion: function() {
    return Session.get('activeRegion');
  },
  thisIsActiveRegion: function() {
    var region = Session.get('activeRegion');
    return region && (this._id === region._id);
  },

  // cities
  cities: function() {
    var region = Session.get('activeRegion');
    return Cities.find({ regionId: region._id }, { sort: { name: 1 } });
  },
  activeCity: function() {
    return Session.get('activeCity');
  },
  thisIsActiveCity: function() {
    var city = Session.get('activeCity');
    return city && (this._id=== city._id);
  },

  // journals
  journals: function() {
    var city = Session.get('activeCity');
    return Journals.find({ cityId: city._id }, { sort: {name: 1 } });
  },
  canNewJournalBeAdded: function() {
    var city = Session.get('activeCity'),
        newJournalName = Session.get('newJournalName');
    return city && city._id && newJournalName && newJournalName.trim() !== '';
  },
  confirmDeleteModalCallback: function() {
    return function(shouldDelete) {
      var journalId = $('#modal-delete-journal').data('journal-id');
      if (shouldDelete) {
        Journals.remove(journalId);
      }
    }
  }

  // editions

});

Template.entryList.events({
  'click #region-list a': function selectRegion(e, template) {
    var activeRegion = Session.get('activeRegion');
    if (activeRegion && activeRegion._id === this._id) {
      Session.set('columnsShown', 1);
      Session.set('activeCity', {});
      Session.set('activeRegion', {});
    } else {
      Session.set('columnsShown', 2);
      Session.set('activeRegion', this);
      setTimeout(function() {
        template.$('#region-list .fill-height-pane').scrollTo(e.currentTarget, 500);
      }, 500);
    }
  },
  'click #deselect-region': function deselectRegion() {
    Session.set('columnsShown', 1);
    Session.set('activeCity', {});
    Session.set('activeRegion', {});
  },
  'click #city-list a': function selectCity(e, template) {
    var activeCity = Session.get('activeCity');
    if (activeCity === this) {
      Session.set('columnsShown', 2);
      Session.set('activeCity', {});
    } else {
      Session.set('columnsShown', 3);
      Session.set('activeCity', this);
      template.$('#city-list .fill-height-pane').scrollTo(e.currentTarget, 5000);
    }
  },
  'click #deselect-city': function deselectCity() {
    Session.set('columnsShown', 2);
    Session.set('activeCity', {});
  },

  // Inserting a new journal
  'focus #new-journal-form input': function showNewJournalFields(e, template) {
    var $inputs = template.$(e.currentTarget).closest('form').find('input');
    $inputs.filter(':gt(0)').removeClass('hidden-field');
    $inputs.filter(':eq(0)').attr('placeholder', 'Nome do jornal');
  },
  'blur #new-journal-form input': function hideNewJournalFields(e, template) {
    var $inputs = template.$(e.currentTarget).closest('form').find('input');
    $inputs.filter(':gt(0)').addClass('hidden-field');
    $inputs.filter(':eq(0)').attr('placeholder', 'Cadastrar jornal');
  },
  'submit #new-journal-form': function newJournal(e, template) {
    var city = Session.get('activeCity'),
        $form = template.$(e.currentTarget),
        $name = $form.find('#new-journal-name'),
        $subTitle = $form.find('#new-journal-sub-title'),
        $owner = $form.find('#new-journal-owner'),
        $price = $form.find('#new-journal-price');

    if (typeof city._id === 'undefined') {
      return false;
    }

    Journals.insert({
      cityId: city._id,
      name: $name.val(),
      subTitle: $subTitle.val(),
      owner: $owner.val(),
      price: $price.val()
    });

    $name.val('');
    $subTitle.val('');
    $owner.val('');
    $price.val('');
    $form.find('input:gt(0)').addClass('hidden-field');
    $form.find('input:eq(0)').attr('placeholder', 'Cadastrar jornal');
    return false;
  },
  'keyup #new-journal-name': function(e) {
    // saves the value of the new journal name in a session variable (for reactivity)
    Session.set('newJournalName', e.currentTarget.value);
  },
  'click #journal-list .delete-button': function(e, template) {
    template.$('#modal-delete-journal').data('journal-id', this._id).openModal();
  }

});



// fixes the height of elements '.fill-height-pane' to the remaining height of the viewport
// those elements must be at the bottom of the page
function setHeights() {
  // height of the screen
  var viewportHeight = $(window).innerHeight();

  this.$('.fill-height-pane').each(function() {
    var $this = $(this),
        fillHeight = viewportHeight - $this.offset().top - ($this.outerHeight(true) - $this.height());
    $(this).height(fillHeight - 1);
  });
}

Template.entryList.rendered = setHeights;

Template.entryList.created = function() {
  $(window).resize(setHeights);
  this.autorun(function() {
    Session.get('activeRegion');
    Session.get('activeCity');
    Session.get('activeJournal');
    setHeights();
  });
};