export const loadingStart = () => ({
  type: "LOADING_START"
});

export const loadingEnd = () => ({
  type: "LOADING_END"
});

export const setBootstrap = (bootstrap: boolean) => ({
  type: "SET_BOOTSTRAP",
  bootstrap
});
