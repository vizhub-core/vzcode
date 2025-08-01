export const asyncRequest = (
  setDataRequest,
  loadAndParseData,
) => {
  setDataRequest({ status: 'Loading' });
  loadAndParseData()
    .then((data) => {
      setDataRequest({ status: 'Succeeded', data });
    })
    .catch((error) => {
      setDataRequest({ status: 'Failed', error });
    });
};