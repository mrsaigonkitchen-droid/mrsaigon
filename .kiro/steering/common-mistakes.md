# ⚠️ Common Mistakes - Lỗi thường gặp khi Vibe Code

## 🔴 TOP 10 LỖI NGHIÊM TRỌNG

### 1. Import sai path
```tsx
// ❌ SAI
import { tokens } from '../../../packages/shared';
import { Button } from 'admin/src/components/Button';

// ✅ ĐÚNG
import { tokens } from '@app/shared';
// Không import cross-app!
```

### 2. Quên await async function
```tsx
// ❌ SAI - Promise không được resolve
const data = fetchData();
console.log(data); // Promise { <pending> }

// ✅ ĐÚNG
const data = await fetchData();
```

### 3. Mutate state trực tiếp
```tsx
// ❌ SAI - React không detect change
items.push(newItem);
setItems(items);

// ✅ ĐÚNG
setItems([...items, newItem]);
// hoặc
setItems(prev => [...prev, newItem]);
```

### 4. useEffect infinite loop
```tsx
// ❌ SAI - Chạy vô hạn
useEffect(() => {
  setData(fetchData());
}); // Thiếu dependency array!

// ❌ SAI - Object/Array trong deps
useEffect(() => {
  doSomething(options);
}, [options]); // options = {} tạo mới mỗi render

// ✅ ĐÚNG
const options = useMemo(() => ({ key: value }), [value]);
useEffect(() => {
  doSomething(options);
}, [options]);
```

### 5. Không handle loading/error states
```tsx
// ❌ SAI - Crash khi data null
return <div>{data.items.map(...)}</div>;

// ✅ ĐÚNG
if (loading) return <Spinner />;
if (error) return <Error message={error} />;
if (!data) return null;
return <div>{data.items.map(...)}</div>;
```

### 6. Key prop sai
```tsx
// ❌ SAI - Index as key
{items.map((item, i) => <Item key={i} />)}

// ❌ SAI - Không có key
{items.map(item => <Item />)}

// ✅ ĐÚNG
{items.map(item => <Item key={item.id} />)}
```

### 7. Event handler trong JSX
```tsx
// ❌ SAI - Tạo function mới mỗi render
<button onClick={() => handleClick(item.id)}>

// ✅ TỐT HƠN - Với useCallback
const handleItemClick = useCallback((id: string) => {
  // logic
}, []);

<button onClick={() => handleItemClick(item.id)}>
```

### 8. Fetch trong render
```tsx
// ❌ SAI - Fetch mỗi render
function Component() {
  const data = fetch('/api/data'); // WRONG!
  return <div>{data}</div>;
}

// ✅ ĐÚNG - Fetch trong useEffect
function Component() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  return <div>{data}</div>;
}
```

### 9. Không validate API input
```ts
// ❌ SAI - Trust user input
app.post('/items', async (c) => {
  const body = await c.req.json();
  await prisma.item.create({ data: body }); // Dangerous!
});

// ✅ ĐÚNG - Validate với Zod
app.post('/items', async (c) => {
  const body = await c.req.json();
  const validated = ItemSchema.parse(body);
  await prisma.item.create({ data: validated });
});
```

### 10. Hardcode values
```tsx
// ❌ SAI
fetch('http://localhost:4202/api/items');
const API_KEY = 'sk-12345';

// ✅ ĐÚNG
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/api/items`);
// API keys should be in .env and server-side only
```

## 🟡 LỖI THƯỜNG GẶP KHÁC

### CSS/Styling
```tsx
// ❌ SAI - String thay vì number
style={{ padding: '16' }}

// ✅ ĐÚNG
style={{ padding: 16 }}
style={{ padding: '16px' }}
```

### TypeScript
```tsx
// ❌ SAI - Ignore errors
// @ts-ignore
const x = something.property;

// ✅ ĐÚNG - Fix the type
const x = (something as SomeType).property;
// hoặc
if ('property' in something) {
  const x = something.property;
}
```

### Prisma
```ts
// ❌ SAI - Quên generate sau khi sửa schema
// Error: Unknown field 'newField'

// ✅ ĐÚNG - Chạy generate
// pnpm db:generate
// pnpm db:push
```

## 🧪 CHECKLIST TRƯỚC KHI COMMIT

- [ ] Không có TypeScript errors
- [ ] Không có ESLint warnings
- [ ] Không có console.log debug
- [ ] Đã test trên browser
- [ ] API endpoints hoạt động
- [ ] Mobile responsive OK
- [ ] Loading states hiển thị
- [ ] Error handling đầy đủ
