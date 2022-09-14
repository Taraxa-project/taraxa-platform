export const nodeStateQuery = `
  query nodeState_query {
    nodeState {
      finalBlock
      dagBlockLevel
      dagBlockPeriod
    }
  }
`;
