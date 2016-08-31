import computed from 'ember-addons/ember-computed-decorators';
import ValidState from 'wizard/mixins/valid-state';
import { ajax } from 'wizard/lib/ajax';

export default Ember.Object.extend(ValidState, {
  id: null,

  @computed('index')
  displayIndex: index => index + 1,

  checkFields() {
    let allValid = true;
    this.get('fields').forEach(field => {
      field.check();
      allValid = allValid && field.get('valid');
    });

    this.setValid(allValid);
  },

  fieldError(id, description) {
    const field = this.get('fields').findProperty('id', id);
    if (field) {
      field.setValid(false, description);
    }
  },

  save() {
    const fields = {};
    this.get('fields').forEach(f => fields[f.id] = f.value);

    return ajax({
      url: `/wizard/steps/${this.get('id')}`,
      type: 'PUT',
      data: { fields }
    }).catch(response => {
      response.responseJSON.errors.forEach(err => this.fieldError(err.field, err.description));
      throw response;
    });
  }
});