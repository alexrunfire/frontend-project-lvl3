import { reduce, differenceBy, isEmpty } from 'lodash';

export default (currentValue, previousValue) => reduce(currentValue,
  (acc, currentItems, key) => {
    const { [key]: previousItems = [] } = previousValue;
    const newItems = differenceBy(currentItems, previousItems, 'guid');
    return isEmpty(newItems) ? acc : newItems;
  }, []);
