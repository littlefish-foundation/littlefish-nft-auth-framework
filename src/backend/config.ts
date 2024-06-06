let apiKey = "";
let networkId = "";

export const setConfig = (key: string, id: string) => {
  apiKey = key;
  networkId = id;
};

export const getConfig = () => ({
  apiKey,
  networkId,
});
