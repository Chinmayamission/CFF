import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

it("setup test", () => {
  expect(1 + 1).toEqual(2);
});
