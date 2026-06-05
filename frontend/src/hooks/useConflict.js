import { useState, useCallback } from 'react';

export const useConflict = () => {
  const [baseCode, setBaseCode] = useState('');
  const [branchA, setBranchA] = useState('');
  const [branchB, setBranchB] = useState('');

  const clearInputs = useCallback(() => {
    setBaseCode('');
    setBranchA('');
    setBranchB('');
  }, []);

  const loadExample = useCallback(() => {
    setBaseCode(`function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`);

    setBranchA(`function calculateTotal(items, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}`);

    setBranchB(`function calculateTotal(items) {
  // Return early if no items
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.price, 0);
}`);
  }, []);

  return {
    baseCode,
    setBaseCode,
    branchA,
    setBranchA,
    branchB,
    setBranchB,
    clearInputs,
    loadExample,
  };
};
