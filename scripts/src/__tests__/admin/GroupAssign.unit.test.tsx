import React from "react";
import { shallow, mount, render } from 'enzyme';
import {Provider} from "react-redux";
import store from "src/store";
import GroupAssign from "../../admin/GroupAssign/GroupAssign";

it('renders group assign correctly', () => {
  const wrapper = render(
    <Provider store={store}><GroupAssign /></Provider>
  );
  expect(wrapper).toMatchSnapshot();
});