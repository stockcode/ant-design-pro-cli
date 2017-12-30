var model = function (props) {
  return ` import modelExtend from 'dva-model-extend';
import { pageModel } from './common';
import { fetch, create, remove, patch } from 'services/${props.name}';

export default modelExtend(pageModel, {
  namespace: '${props.name}',

  state: {
    data: [],
    pagination: null
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/${props.name}') {
          dispatch({ type: 'fetch', payload: query });
        }
      });
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const { data, pagination } = yield call(fetch, payload);
      yield put({
        type: 'save',
        payload: {
          data,
          pagination
        },
      });
    },

    *create({ payload }, { call, put }) {
      yield call(create, payload);
      yield put({ type: 'reload' });
    },

    *patch({ payload: { id, params } }, { call, put }) {
      yield call(patch, id, params);
      yield put({ type: 'reload' });
    },
    
    *remove({ payload: id }, { call, put }) {
      yield call(remove, id);
      yield put({ type: 'reload' });
    },

    *reload(action, { put, select }) {
      const page = yield select(state => state.${props.name}.page);
      yield put({ type: 'fetch', payload: { page } });
    },
  },

  reducers: {
    save(state, { payload: { data, pagination } }) {
        return { ...state, data, pagination };
      },
  },

});

`;
};

var service = function (props) {
  return `import request from '../utils/request';
import config from '../utils/config';

const { ${props.name} } = config.api;

export async function fetch(params) {
  return request(${props.name}, {
    body: params,
  });
}

export async function create(params) {
  return request(${props.name}, {
    method: 'post',
    body: params,
  });
}

export function patch(id, params) {
  return request(${props.name} + '/' + id, {
    method: 'PUT',
    body: params,
  });
}

export function remove(id) {
  return request(${props.name} + '/' + id, {
    method: 'DELETE',
  });
}


`;
};

module.exports = {
  model: model,
  service: service,
};
