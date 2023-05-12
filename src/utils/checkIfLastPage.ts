const checkIfLastPage = (
    page: number,
    itemsCount: number,
    itemsPerPage: number
) => {
    if (page === 0) {
        if (itemsPerPage >= itemsCount) {
            return true;
        } else {
            return false;
        }
    } else {
        if (itemsCount - page * itemsPerPage <= itemsPerPage) {
            return true;
        } else {
            return false;
        }
    }
};
export default checkIfLastPage;
