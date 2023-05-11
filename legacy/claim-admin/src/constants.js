const constants = {
  baseUrl: process.env.REACT_APP_BASE_URL,
  batchTypes: [
    { id: "PRIVATE_SALE", name: "Private Sale" },
    { id: "PUBLIC_SALE", name: "Public Sale" },
    { id: "COMMUNITY_ACTIVITY", name: "Community Activity" },
  ],
};

export default constants;
