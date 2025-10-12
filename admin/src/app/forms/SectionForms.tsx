import { useState } from 'react';
import { BannerSchema, CtaSchema, FeaturedMenuSchema, GallerySchema, HeroSchema, RichTextSchema, TestimonialsSchema } from '../schemas';
import { useRecentUploads } from '../RecentUploads';

type CommonProps = { onSubmit: (data: unknown) => void };

export function HeroForm({ onSubmit }: CommonProps) {
	const [title, setTitle] = useState('');
	const [subtitle, setSubtitle] = useState('');
	const [backgroundMediaId, setBackgroundMediaId] = useState('');
	const { items } = useRecentUploads();
	const [error, setError] = useState<string | null>(null);
	return (
		<div style={{ display: 'grid', gap: 12 }}>
			<input placeholder="Tiêu đề chính (ví dụ: Nhà hàng của chúng tôi)" value={title} onChange={(e)=>setTitle(e.target.value)} />
			<input placeholder="Phụ đề (tùy chọn)" value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} />
			<div style={{ display: 'flex', gap: 8 }}>
				<input placeholder="ID ảnh nền (chọn ở danh sách bên phải)" value={backgroundMediaId} onChange={(e)=>setBackgroundMediaId(e.target.value)} />
				<select value={backgroundMediaId} onChange={(e)=>setBackgroundMediaId(e.target.value)}>
					<option value="">Recent uploads…</option>
					{items.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
				</select>
			</div>
			<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<button onClick={() => {
					try {
						setError(null);
						onSubmit(HeroSchema.parse({ title, subtitle: subtitle || undefined, backgroundMediaId: backgroundMediaId || undefined }));
					} catch (e) {
						setError((e as Error).message);
					}
				}}>Create</button>
				{error && <span style={{ color: '#ef4444' }}>{error}</span>}
			</div>
			{(backgroundMediaId || title || subtitle) && (
				<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
					<strong>Preview</strong>
					<div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
						{backgroundMediaId ? (
							<img src={(items.find(i=>i.id===backgroundMediaId)?.url || '').startsWith('http') ? (items.find(i=>i.id===backgroundMediaId)?.url || '') : `http://localhost:4202${items.find(i=>i.id===backgroundMediaId)?.url || ''}`} alt="background" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
						) : (
							<div style={{ width: 120, height: 80, background: '#f3f4f6', borderRadius: 6 }} />
						)}
						<div>
							<div style={{ fontWeight: 600 }}>{title || 'Tiêu đề'}</div>
							<div style={{ color: '#6b7280' }}>{subtitle || 'Phụ đề'}</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export function GalleryForm({ onSubmit }: CommonProps) {
	const [mediaIds, setMediaIds] = useState<string>('');
	const [autoplay, setAutoplay] = useState(true);
	const { items } = useRecentUploads();
	return (
		<div style={{ display: 'grid', gap: 12 }}>
			<div style={{ display: 'flex', gap: 8 }}>
				<input placeholder="Danh sách ID ảnh, cách nhau bằng dấu phẩy" value={mediaIds} onChange={(e)=>setMediaIds(e.target.value)} />
				<select onChange={(e)=> setMediaIds((prev) => (prev ? prev + ',' : '') + e.target.value)} value="">
					<option value="">Add from recent uploads…</option>
					{items.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
				</select>
			</div>
			<label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<input type="checkbox" checked={autoplay} onChange={(e)=>setAutoplay(e.target.checked)} /> Autoplay
			</label>
			{mediaIds && (
				<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
					<strong>Preview</strong>
					<div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
						{mediaIds.split(',').map(id => id.trim()).filter(Boolean).map((id, i) => {
							const url = items.find(x=>x.id===id)?.url;
							const src = url ? (url.startsWith('http') ? url : `http://localhost:4202${url}`) : undefined;
							return src ? (
								<img key={id + i} src={src} alt={`gallery-${i}`} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6 }} />
							) : (
								<span key={id + i} style={{ fontSize: 12, color: '#ef4444' }}>Missing {id}</span>
							);
						})}
					</div>
				</div>
			)}
			<button onClick={() => {
				const ids = mediaIds.split(',').map(s => s.trim()).filter(Boolean);
				onSubmit(GallerySchema.parse({ items: ids.map(id => ({ mediaId: id })), autoplay }));
			}}>Create</button>
		</div>
	);
}

export function FeaturedMenuForm({ onSubmit }: CommonProps) {
	const [title, setTitle] = useState('');
	const [price, setPrice] = useState('');
	const [mediaId, setMediaId] = useState('');
	const { items } = useRecentUploads();
	return (
		<div style={{ display: 'grid', gap: 12 }}>
			<input placeholder="Tên món (ví dụ: Bò bít tết)" value={title} onChange={(e)=>setTitle(e.target.value)} />
			<input placeholder="Giá (ví dụ: 159000)" value={price} onChange={(e)=>setPrice(e.target.value)} />
			<div style={{ display: 'flex', gap: 8 }}>
				<input placeholder="mediaId" value={mediaId} onChange={(e)=>setMediaId(e.target.value)} />
				<select value={mediaId} onChange={(e)=>setMediaId(e.target.value)}>
					<option value="">Recent uploads…</option>
					{items.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
				</select>
			</div>
			{(title || price || mediaId) && (
				<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
					<strong>Preview</strong>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
						{mediaId ? (
							<img src={(items.find(i=>i.id===mediaId)?.url || '').startsWith('http') ? (items.find(i=>i.id===mediaId)?.url || '') : `http://localhost:4202${items.find(i=>i.id===mediaId)?.url || ''}`} alt="menu-item" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} />
						) : (
							<div style={{ width: 72, height: 72, background: '#f3f4f6', borderRadius: 6 }} />
						)}
						<div>
							<div style={{ fontWeight: 600 }}>{title || 'Tên món'}</div>
							<div style={{ color: '#6b7280' }}>{price ? Intl.NumberFormat('vi-VN').format(Number(price)) + ' đ' : 'Giá'}</div>
						</div>
					</div>
				</div>
			)}
			<button onClick={() => onSubmit(FeaturedMenuSchema.parse({ items: [{ title, price: price ? Number(price) : undefined, mediaId: mediaId || undefined }] }))}>Create</button>
		</div>
	);
}

export function CtaForm({ onSubmit }: CommonProps) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [label, setLabel] = useState('');
	const [href, setHref] = useState('');
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<input placeholder="Tiêu đề lời kêu gọi (CTA)" value={title} onChange={(e)=>setTitle(e.target.value)} />
			<input placeholder="Mô tả ngắn (tùy chọn)" value={description} onChange={(e)=>setDescription(e.target.value)} />
			<input placeholder="Nút: nhãn" value={label} onChange={(e)=>setLabel(e.target.value)} />
			<input placeholder="Nút: đường dẫn (https://...)" value={href} onChange={(e)=>setHref(e.target.value)} />
			<button onClick={() => onSubmit(CtaSchema.parse({ title, description: description || undefined, button: { label, href } }))}>Create</button>
		</div>
	);
}

export function TestimonialsForm({ onSubmit }: CommonProps) {
	const [name, setName] = useState('');
	const [text, setText] = useState('');
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<input placeholder="Tên khách hàng" value={name} onChange={(e)=>setName(e.target.value)} />
			<input placeholder="Nội dung đánh giá" value={text} onChange={(e)=>setText(e.target.value)} />
			<button onClick={() => onSubmit(TestimonialsSchema.parse({ items: [{ name, text }] }))}>Create</button>
		</div>
	);
}

export function RichTextForm({ onSubmit }: CommonProps) {
	const [html, setHtml] = useState('<p>Xin chào!</p>');
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<textarea rows={4} placeholder="Nội dung HTML (ví dụ: <p>Chào mừng!</p>)" value={html} onChange={(e)=>setHtml(e.target.value)} />
			<button onClick={() => onSubmit(RichTextSchema.parse({ html }))}>Create</button>
		</div>
	);
}

export function BannerForm({ onSubmit }: CommonProps) {
	const [text, setText] = useState('');
	const [mediaId, setMediaId] = useState('');
	const [href, setHref] = useState('');
	const { items } = useRecentUploads();
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<input placeholder="Dòng chữ (ví dụ: Khuyến mãi cuối tuần)" value={text} onChange={(e)=>setText(e.target.value)} />
			<div style={{ display: 'flex', gap: 8 }}>
				<input placeholder="mediaId" value={mediaId} onChange={(e)=>setMediaId(e.target.value)} />
				<select value={mediaId} onChange={(e)=>setMediaId(e.target.value)}>
					<option value="">Recent uploads…</option>
					{items.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
				</select>
			</div>
			<input placeholder="Link (tùy chọn)" value={href} onChange={(e)=>setHref(e.target.value)} />
			<button onClick={() => onSubmit(BannerSchema.parse({ text, mediaId: mediaId || undefined, href: href || undefined }))}>Create</button>
		</div>
	);
}

export function ReservationFormForm({ onSubmit }: CommonProps) {
	const [title, setTitle] = useState('Đặt bàn');
	const [description, setDescription] = useState('Vui lòng điền thông tin để đặt bàn. Chúng tôi sẽ liên hệ xác nhận trong vòng 24h.');
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<input placeholder="Tiêu đề" value={title} onChange={(e)=>setTitle(e.target.value)} />
			<textarea rows={2} placeholder="Mô tả" value={description} onChange={(e)=>setDescription(e.target.value)} />
			<button onClick={() => onSubmit({ title, description })}>Create Reservation Form</button>
		</div>
	);
}

export function SpecialOffersForm({ onSubmit }: CommonProps) {
	const [title, setTitle] = useState('Khuyến Mãi Đặc Biệt');
	const [subtitle, setSubtitle] = useState('Các ưu đãi hấp dẫn dành cho bạn');
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<input placeholder="Tiêu đề" value={title} onChange={(e)=>setTitle(e.target.value)} />
			<input placeholder="Phụ đề" value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} />
			<p style={{ fontSize: 12, color: '#6b7280' }}>Lưu ý: Danh sách ưu đãi sẽ được tải tự động từ API</p>
			<button onClick={() => onSubmit({ title, subtitle })}>Create Special Offers</button>
		</div>
	);
}

export function ContactInfoForm({ onSubmit }: CommonProps) {
	const [title, setTitle] = useState('Liên Hệ & Địa Chỉ');
	const [address, setAddress] = useState('25 Đường Bờ Vịnh, Quận Biển, TP. Đà Nẵng');
	const [phone, setPhone] = useState('0901 234 567');
	const [email, setEmail] = useState('info@restaurant.com');
	const [mapUrl, setMapUrl] = useState('');
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<input placeholder="Tiêu đề" value={title} onChange={(e)=>setTitle(e.target.value)} />
			<input placeholder="Địa chỉ" value={address} onChange={(e)=>setAddress(e.target.value)} />
			<input placeholder="Điện thoại" value={phone} onChange={(e)=>setPhone(e.target.value)} />
			<input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
			<input placeholder="Google Maps Embed URL (optional)" value={mapUrl} onChange={(e)=>setMapUrl(e.target.value)} />
			<button onClick={() => onSubmit({ 
				title, 
				address, 
				phone, 
				email,
				mapEmbedUrl: mapUrl || undefined,
				hours: [
					{ day: 'Thứ 2 - Thứ 6', time: '10:00 - 22:00' },
					{ day: 'Thứ 7 - Chủ nhật', time: '09:00 - 23:00' }
				],
				socialLinks: [
					{ platform: 'facebook', url: 'https://facebook.com' },
					{ platform: 'instagram', url: 'https://instagram.com' }
				]
			})}>Create Contact Info</button>
		</div>
	);
}

export function StatsForm({ onSubmit }: CommonProps) {
	const [title, setTitle] = useState('Con Số Ấn Tượng');
	const [subtitle, setSubtitle] = useState('Chúng tôi tự hào về những thành tựu đạt được');
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<input placeholder="Tiêu đề" value={title} onChange={(e)=>setTitle(e.target.value)} />
			<input placeholder="Phụ đề" value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} />
			<button onClick={() => onSubmit({ 
				title, 
				subtitle,
				stats: [
					{ icon: 'ri-calendar-line', value: 15, label: 'Năm kinh nghiệm', suffix: '+', color: '#f59e0b' },
					{ icon: 'ri-team-line', value: 50000, label: 'Khách hàng hài lòng', suffix: '+', color: '#10b981' },
					{ icon: 'ri-restaurant-line', value: 200, label: 'Món ăn đặc sắc', suffix: '+', color: '#ef4444' },
					{ icon: 'ri-star-fill', value: 4.9, label: 'Đánh giá trung bình', suffix: '/5', color: '#f59e0b' }
				]
			})}>Create Stats Section</button>
		</div>
	);
}

export type FormKind = 'HERO'|'GALLERY'|'FEATURED_MENU'|'CTA'|'TESTIMONIALS'|'RICH_TEXT'|'BANNER'|'RESERVATION_FORM'|'SPECIAL_OFFERS'|'CONTACT_INFO'|'STATS';

export function SectionFormFactory({ kind, onSubmit }: { kind: FormKind; onSubmit: (data: unknown) => void }) {
	switch (kind) {
		case 'HERO': return <HeroForm onSubmit={onSubmit} />;
		case 'GALLERY': return <GalleryForm onSubmit={onSubmit} />;
		case 'FEATURED_MENU': return <FeaturedMenuForm onSubmit={onSubmit} />;
		case 'CTA': return <CtaForm onSubmit={onSubmit} />;
		case 'TESTIMONIALS': return <TestimonialsForm onSubmit={onSubmit} />;
		case 'RICH_TEXT': return <RichTextForm onSubmit={onSubmit} />;
		case 'BANNER': return <BannerForm onSubmit={onSubmit} />;
		case 'RESERVATION_FORM': return <ReservationFormForm onSubmit={onSubmit} />;
		case 'SPECIAL_OFFERS': return <SpecialOffersForm onSubmit={onSubmit} />;
		case 'CONTACT_INFO': return <ContactInfoForm onSubmit={onSubmit} />;
		case 'STATS': return <StatsForm onSubmit={onSubmit} />;
		default: return null;
	}
}


