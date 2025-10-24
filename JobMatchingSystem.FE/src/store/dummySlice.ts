import { createSlice } from "@reduxjs/toolkit";

// Đây là một slice (reducer) giả, không làm gì cả
// Mục đích duy nhất là để Redux store có thứ để nạp
const dummySlice = createSlice({
  name: "dummy",
  initialState: { status: "idle" },
  reducers: {
    // Không cần thêm gì ở đây
  },
});

export default dummySlice.reducer;
