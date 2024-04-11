import axios from 'axios';

const API_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
const PROJECT_ID = process.env.REACT_APP_PROJECT_ID;

const blockfrostAPI = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    project_id: PROJECT_ID,
  },
});


export const GetAssets = async (address) => {
  try {
    const response = await blockfrostAPI.get(`/addresses/${address}/utxos`)
    return response.data;
  } catch (error) {
    console.error('Error fetching assets for addresses:', error);
    throw error;
  }
}