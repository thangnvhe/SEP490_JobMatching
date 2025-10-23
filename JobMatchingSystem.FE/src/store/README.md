# Redux Store Setup

## Cấu trúc thư mục
```
src/store/
├── index.ts          # Store configuration
├── Provider.tsx      # Redux Provider wrapper
├── slices/           # Redux slices
│   └── counterSlice.ts
└── README.md         # Hướng dẫn sử dụng
```

## Cách sử dụng

### 1. Tạo một slice mới
```typescript
// src/store/slices/exampleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ExampleState = {
  data: [],
  loading: false,
  error: null,
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setData: (state, action: PayloadAction<any[]>) => {
      state.data = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setData, setError } = exampleSlice.actions;
export default exampleSlice.reducer;
```

### 2. Thêm slice vào store
```typescript
// src/store/index.ts
import exampleSlice from './slices/exampleSlice';

export const store = configureStore({
  reducer: {
    example: exampleSlice,
    // ... other slices
  },
});
```

### 3. Sử dụng trong component
```typescript
import { useAppDispatch, useAppSelector } from '../store';
import { setLoading, setData } from '../store/slices/exampleSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.example);

  const handleFetchData = async () => {
    dispatch(setLoading(true));
    try {
      const result = await fetchData();
      dispatch(setData(result));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
};
```

## Async Actions với createAsyncThunk
```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUserData = createAsyncThunk(
  'user/fetchData',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
```

## Demo Component
Component `CounterDemo` đã được tạo để demo cách sử dụng Redux cơ bản. Bạn có thể import và sử dụng nó trong bất kỳ component nào.
