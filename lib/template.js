var model = function (props) {
  return ` import modelExtend from 'dva-model-extend';
import { pageModel } from './common';
import { queryList, create, remove } from 'services/${props.name}';

export default modelExtend(pageModel, {
  namespace: '${props.name}',

  state: {
    loading: false,
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/${props.name}s') {
          dispatch({ type: 'query', payload: query });
        }
      });
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      if (res.success) {
        yield put({
          type: 'querySuccess',
          payload: {
            list: res.data,
            pagination: res.pagination,
          }
        })
      }
    },

    *create({ payload }, { call, put }) {
      yield call(create, payload);
      yield put({ type: 'reload' });
    },

    *remove({ payload: id }, { call, put }) {
      yield call(remove, id);
      yield put({ type: 'reload' });
    },

    *reload(action, { put, select }) {
      const page = yield select(state => state.${props.name}s.page);
      yield put({ type: 'query', payload: { page } });
    },
  },

  reducers: {
  },

});

`;
};

var service = function (props) {
  return `import request from '../utils/request';
import config from '../utils/config';

const { ${props.name} } = config.api;

export async function queryList(params) {
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
