import {CustomField, CustomFieldState, initialCustomFieldState} from './custom-field.model';
import {CustomFieldActions, customFieldReducer} from './custom-field.reducer';
import {List, OrderedMap} from 'immutable';
import {cloneObject} from '../../utils/test-util.spec';

export function getTestCustomFieldsInput() {
  return cloneObject({
    'Custom-1': [
      {
        key: 'c1-A',
        value: 'First C1'
      },
      {
        key: 'c1-B',
        value: 'Second C1'
      },
      {
        key: 'c1-C',
        value: 'Third C1'
      }
    ],
    'Custom-2': [
      {
        key: 'c2-A',
        value: 'First C2'
      },
      {
        key: 'c2-B',
        value: 'Second C2'
      }
    ]
  });
}

describe('CustomField reducer tests', () => {
  describe('Deserialize', () => {
    it('Deserialize initial state', () => {
      const state: CustomFieldState =
        customFieldReducer(initialCustomFieldState, CustomFieldActions.createDeserializeCustomFields(getTestCustomFieldsInput()));
      const map: OrderedMap<string, List<CustomField>> = state.fields.map(value => value.toList()).toOrderedMap();
      expect(map.size).toBe(2);
      const l1 = map.get('Custom-1');
      expect(l1.size).toBe(3);
      expect(l1.get(0).key).toEqual('c1-A');
      expect(l1.get(0).value).toEqual('First C1');
      expect(l1.get(1).key).toEqual('c1-B');
      expect(l1.get(1).value).toEqual('Second C1');
      expect(l1.get(2).key).toEqual('c1-C');
      expect(l1.get(2).value).toEqual('Third C1');
      const l2 = map.get('Custom-2');
      expect(l2.size).toBe(2);
      expect(l2.get(0).key).toEqual('c2-A');
      expect(l2.get(0).value).toEqual('First C2');
      expect(l2.get(1).key).toEqual('c2-B');
      expect(l2.get(1).value).toEqual('Second C2');

    });

    it ('Deserialize same state', () => {
      const stateA: CustomFieldState =
        customFieldReducer(initialCustomFieldState, CustomFieldActions.createDeserializeCustomFields(getTestCustomFieldsInput()));
      const stateB: CustomFieldState =
        customFieldReducer(stateA, CustomFieldActions.createDeserializeCustomFields(getTestCustomFieldsInput()));
      expect(stateA).toBe(stateB);
    });
  });

  describe('Changes', () => {
    it ('Add several custom fields', () => {
      const state: CustomFieldState =
        customFieldReducer(initialCustomFieldState, CustomFieldActions.createDeserializeCustomFields(getTestCustomFieldsInput()));
      const newState: CustomFieldState =
        customFieldReducer(state, CustomFieldActions.createAddCustomFields({
          'Custom-1': [{key: 'c1-a', value: 'A'}, {key: 'c1-z', value: 'Z'}],
          'Custom-2': [{key: 'c2-k', value: 'k'}]}));
      const map: OrderedMap<string, List<CustomField>> = newState.fields.map(value => value.toList()).toOrderedMap();
      expect(map.size).toBe(2);
      const l1 = map.get('Custom-1');
      expect(l1.size).toBe(5);
      expect(l1.get(0).key).toEqual('c1-a');
      expect(l1.get(0).value).toEqual('A');
      expect(l1.get(1).key).toEqual('c1-A');
      expect(l1.get(1).value).toEqual('First C1');
      expect(l1.get(2).key).toEqual('c1-B');
      expect(l1.get(2).value).toEqual('Second C1');
      expect(l1.get(3).key).toEqual('c1-C');
      expect(l1.get(3).value).toEqual('Third C1');
      expect(l1.get(4).key).toEqual('c1-z');
      expect(l1.get(4).value).toEqual('Z');
      const l2 = map.get('Custom-2');
      expect(l2.size).toBe(3);
      expect(l2.get(0).key).toEqual('c2-A');
      expect(l2.get(0).value).toEqual('First C2');
      expect(l2.get(1).key).toEqual('c2-k');
      expect(l2.get(1).value).toEqual('k');
      expect(l2.get(2).key).toEqual('c2-B');
      expect(l2.get(2).value).toEqual('Second C2');
    });

    it ('Add one custom field', () => {
      const state: CustomFieldState =
        customFieldReducer(initialCustomFieldState, CustomFieldActions.createDeserializeCustomFields(getTestCustomFieldsInput()));
      const newState: CustomFieldState =
        customFieldReducer(state, CustomFieldActions.createAddCustomFields({
          'Custom-2': [{key: 'c2-k', value: 'k'}]}));
      const map: OrderedMap<string, List<CustomField>> = newState.fields.map(value => value.toList()).toOrderedMap();
      expect(map.size).toBe(2);
      const l1 = map.get('Custom-1');
      expect(l1.size).toBe(3);
      expect(l1.get(0).key).toEqual('c1-A');
      expect(l1.get(0).value).toEqual('First C1');
      expect(l1.get(1).key).toEqual('c1-B');
      expect(l1.get(1).value).toEqual('Second C1');
      expect(l1.get(2).key).toEqual('c1-C');
      expect(l1.get(2).value).toEqual('Third C1');
      const l2 = map.get('Custom-2');
      expect(l2.size).toBe(3);
      expect(l2.get(0).key).toEqual('c2-A');
      expect(l2.get(0).value).toEqual('First C2');
      expect(l2.get(1).key).toEqual('c2-k');
      expect(l2.get(1).value).toEqual('k');
      expect(l2.get(2).key).toEqual('c2-B');
      expect(l2.get(2).value).toEqual('Second C2');
    });

    it ('No change', () => {
      const state: CustomFieldState =
        customFieldReducer(initialCustomFieldState, CustomFieldActions.createDeserializeCustomFields(getTestCustomFieldsInput()));
      const newState: CustomFieldState =
        customFieldReducer(state, CustomFieldActions.createAddCustomFields(null));
      expect(newState).toBe(state);
    });
  });
});