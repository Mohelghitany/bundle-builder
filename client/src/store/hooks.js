import { useDispatch, useSelector } from "react-redux";

// Thin wrappers keep call sites consistent and make a future TS migration easy.
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
