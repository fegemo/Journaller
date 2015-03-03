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
      template.$('#city-list .fill-height-pane').scrollTo(e.currentTarget, 500);
    }
  },
  'click #deselect-city': function deselectCity() {
    Session.set('columnsShown', 2);
    Session.set('activeCity', {});
  },

  // Inserting a new journal
  'focus #new-journal-name': function showNewJournalFields(e, template) {
    template.$(e.currentTarget).closest('form').find('input:gt(0)').slideDown();
  },
  'blur #new-journal-form': function hideNewJournalFields(e, template) {
    var $focused = $(document.activeElement);
    if ($focused.closest('#new-journal-form').length !== 1){
      template.$(e.currentTarget).closest('form').find('input:gt(0)').slideUp();
    }
  },
  'submit #new-journal-form': function newJournal(e, template) {
    var city = Session.get('activeCity'),
        $form = template.$(e.currentTarget),
        $name = $form.find('#new-journal-name'),
        $subTitle = $form.find('#new-journal-sub-title'),
        $owner = $form.find('#new-journal-owner'),
        $price = $form.find('#new-journal-price');

    if (typeof city._id === 'undefined') {
      return;
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
    template.$(e.currentTarget).closest('form').find('input:gt(0)').slideUp();

    return false;
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