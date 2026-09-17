import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles, CheckCircle, Edit, Instagram, Upload } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function AdminProductManager({ onBackToStore }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'ugc'
  const [products, setProducts] = useState([]);
  const [ugcPosts, setUgcPosts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Rings');
  const [description, setDescription] = useState('');
  const [purity, setPurity] = useState('Fine 18K Gold Plated, 925 Silver & Stainless steels');
  const [isAntiTarnish, setIsAntiTarnish] = useState(true);
  const [isHallmarked, setIsHallmarked] = useState(true); // 925 Hallmark option

  const [variants, setVariants] = useState([
    {
      metalTone: 'Yellow Gold',
      sku: `ZLQ-${Date.now()}-YG`,
      price: '',
      compareAtPrice: '',
      images: [],
      hoverVideo: '',
      stock: 10
    }
  ]);

  // UGC Form State
  const [ugcTitle, setUgcTitle] = useState('');
  const [ugcImage, setUgcImage] = useState('');
  const [ugcMediaType, setUgcMediaType] = useState('IMAGE'); // 'IMAGE' or 'REEL'

  // Fetch all live products and Instagram posts
  const fetchAllData = async () => {
    try {
      const [prodRes, ugcRes] = await Promise.all([
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/ugc`)
      ]);
      const prodData = await prodRes.json();
      const ugcData = await ugcRes.json();
      if (prodData.success) setProducts(prodData.products);
      if (ugcData.success) setUgcPosts(ugcData.posts);
    } catch (err) {
      console.error('Data Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Process File to Base64
  const processImageFile = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  };

  // Direct Clipboard Paste Handler (Ctrl + V)
  const handleImagePaste = (e, variantIdx) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        processImageFile(file, (base64) => {
          const updated = [...variants];
          updated[variantIdx].images.push(base64);
          setVariants(updated);
        });
      }
    }
  };

  // Multiple File Upload Handler
  const handleFileUpload = (e, variantIdx) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      processImageFile(file, (base64) => {
        const updated = [...variants];
        updated[variantIdx].images.push(base64);
        setVariants(updated);
      });
    });
  };

  const removeImage = (variantIdx, imgIdx) => {
    const updated = [...variants];
    updated[variantIdx].images.splice(imgIdx, 1);
    setVariants(updated);
  };

  // Populate form for Editing Existing Product
  const startEditProduct = (p) => {
    setEditingProductId(p._id);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setPurity(p.purity);
    setIsAntiTarnish(p.isAntiTarnish);
    setIsHallmarked(p.isHallmarked);
    setVariants(p.variants);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setTitle('');
    setDescription('');
    setPurity('Fine 18K Gold Plated, 925 Silver & Stainless steels');
    setVariants([
      {
        metalTone: 'Yellow Gold',
        sku: `ZLQ-${Date.now()}-YG`,
        price: '',
        compareAtPrice: '',
        images: [],
        hoverVideo: '',
        stock: 10
      }
    ]);
  };

  // Submit Product Form (Create or Update)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    const formattedVariants = variants.map((v) => ({
      ...v,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      stock: Number(v.stock),
      images: v.images.length > 0 ? v.images : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800']
    }));

    const payload = {
      title,
      category,
      description,
      purity,
      isAntiTarnish,
      isHallmarked,
      variants: formattedVariants
    };

    try {
      const url = editingProductId ? `${API_BASE}/api/products/${editingProductId}` : `${API_BASE}/api/products`;
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(editingProductId ? '✨ Product updated successfully!' : '✨ New product published to store!');
        cancelEdit();
        fetchAllData();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Network Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  // Submit UGC Item (Instagram Reel / Photo)
  const handleUgcSubmit = async (e) => {
    e.preventDefault();
    if (!ugcImage) return alert('Please paste or upload an image/video file');

    await fetch(`${API_BASE}/api/ugc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: ugcTitle,
        mediaUrl: ugcImage,
        mediaType: ugcMediaType,
        handle: '@zelqia_jewels'
      })
    });
    setUgcTitle('');
    setUgcImage('');
    fetchAllData();
  };

  const handleDeleteUgc = async (id) => {
    if (!window.confirm('Delete this Instagram showcase?')) return;
    await fetch(`${API_BASE}/api/ugc/${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  return (
    <div className="min-h-screen bg-zelqia-bg text-zelqia-ivory font-sans p-6 max-w-6xl mx-auto selection:bg-zelqia-gold selection:text-zelqia-bg">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-zelqia-border/40 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-zelqia-gold hover:text-zelqia-goldLight border border-zelqia-border px-3 py-2"
          >
            <ArrowLeft size={16} /> Back to Live Store
          </button>
          <h1 className="font-serif text-2xl md:text-3xl text-zelqia-ivory tracking-wider uppercase">
            ZELQIA <span className="text-zelqia-gold font-light">Vault Control</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-zelqia-gold text-zelqia-bg shadow-md'
                : 'bg-zelqia-card text-zelqia-muted hover:text-zelqia-ivory border border-zelqia-border'
            }`}
          >
            Jewellery Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('ugc')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'ugc'
                ? 'bg-zelqia-gold text-zelqia-bg shadow-md'
                : 'bg-zelqia-card text-zelqia-muted hover:text-zelqia-ivory border border-zelqia-border'
            }`}
          >
            <Instagram size={14} /> Styled By You (@zelqia_jewels)
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-zelqia-gold/10 border border-zelqia-gold p-4 mb-8 text-zelqia-gold flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* TAB 1: PRODUCT MANAGER */}
      {activeTab === 'products' && (
        <>
          <form onSubmit={handleProductSubmit} className="bg-zelqia-card border border-zelqia-border/50 p-6 md:p-8 rounded-sm mb-12 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-zelqia-gold uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={18} /> {editingProductId ? 'Editing Product' : 'Add New Jewellery Item'}
              </h2>
              {editingProductId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs uppercase text-zelqia-muted hover:text-zelqia-ivory underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-zelqia-muted block mb-2">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Solitaire Diamond Ring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border p-3 text-sm text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-zelqia-muted block mb-2">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border p-3 text-sm text-zelqia-ivory focus:border-zelqia-gold outline-none"
                >
                  <option value="Rings">Rings</option>
                  <option value="Necklaces">Necklaces</option>
                  <option value="Bracelets">Bracelets</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Men">Men's Accessories</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-zelqia-muted block mb-2">Description</label>
                <textarea
                  rows="3"
                  placeholder="Craftsmanship, stones, styling tips..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border p-3 text-sm text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-zelqia-muted block mb-2">Metal Purity / Description</label>
                <input
                  type="text"
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border p-3 text-sm text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
              </div>

              {/* 925 Hallmark vs Stainless Steel Dropdown Option */}
              <div>
                <label className="text-xs uppercase tracking-widest text-zelqia-muted block mb-2">Certification & Grade *</label>
                <select
                  value={isHallmarked ? '925_HALLMARK' : 'STAINLESS_STEEL'}
                  onChange={(e) => setIsHallmarked(e.target.value === '925_HALLMARK')}
                  className="w-full bg-zelqia-bg border border-zelqia-border p-3 text-sm text-zelqia-ivory focus:border-zelqia-gold outline-none"
                >
                  <option value="925_HALLMARK">💎 925 Hallmark Certified (Silver/Gold)</option>
                  <option value="STAINLESS_STEEL">🛡️ Stainless Steel / Anti-Tarnish Certified</option>
                  <option value="FASHION">✦ Demi-Fine Fashion Grade</option>
                </select>
              </div>

              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zelqia-ivory uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAntiTarnish}
                    onChange={(e) => setIsAntiTarnish(e.target.checked)}
                    className="accent-zelqia-gold h-4 w-4"
                  />
                  Anti-Tarnish Lifetime Shield
                </label>
              </div>
            </div>

            {/* Metal Variants & Direct Paste Images */}
            <div className="border-t border-zelqia-border/40 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-zelqia-ivory tracking-wide">
                  Metal Variants & Direct Image Uploads
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setVariants([
                      ...variants,
                      {
                        metalTone: 'Rose Gold',
                        sku: `ZLQ-${Date.now()}-RG`,
                        price: '',
                        compareAtPrice: '',
                        images: [],
                        hoverVideo: '',
                        stock: 10
                      }
                    ])
                  }
                  className="flex items-center gap-1 text-xs uppercase tracking-wider text-zelqia-gold hover:text-zelqia-goldLight border border-zelqia-border px-3 py-1.5"
                >
                  <Plus size={14} /> Add Color Variant
                </button>
              </div>

              <div className="space-y-6">
                {variants.map((v, vIdx) => (
                  <div key={vIdx} className="bg-zelqia-cardElevated border border-zelqia-border/40 p-5 rounded-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-zelqia-muted block mb-1">Tone</label>
                        <select
                          value={v.metalTone}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[vIdx].metalTone = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                        >
                          <option value="Yellow Gold">Yellow Gold</option>
                          <option value="Rose Gold">Rose Gold</option>
                          <option value="925 Silver">925 Silver</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-zelqia-muted block mb-1">Selling Price (₹) *</label>
                        <input
                          type="number"
                          required
                          placeholder="2999"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[vIdx].price = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-zelqia-muted block mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          placeholder="4999"
                          value={v.compareAtPrice || ''}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[vIdx].compareAtPrice = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-zelqia-muted block mb-1">Stock</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[vIdx].stock = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-full bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                        />
                      </div>
                    </div>

                    {/* Direct Image Box */}
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-zelqia-gold block mb-2 font-semibold">
                        Images for {v.metalTone} (Paste directly via Ctrl + V or choose files)
                      </label>

                      <div
                        onPaste={(e) => handleImagePaste(e, vIdx)}
                        tabIndex="0"
                        className="border-2 border-dashed border-zelqia-border/80 hover:border-zelqia-gold p-6 text-center bg-zelqia-bg cursor-pointer transition-colors outline-none"
                      >
                        <Upload size={24} className="mx-auto text-zelqia-gold mb-2" />
                        <p className="text-xs text-zelqia-ivory font-medium">Click here & press <kbd className="bg-zelqia-card px-1.5 py-0.5 border border-zelqia-border text-zelqia-gold">Ctrl + V</kbd> to paste an image</p>
                        <p className="text-[10px] text-zelqia-muted mt-1">or browse files from your computer</p>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, vIdx)}
                          className="hidden"
                          id={`file-upload-${vIdx}`}
                        />
                        <label
                          htmlFor={`file-upload-${vIdx}`}
                          className="mt-3 inline-block bg-zelqia-card border border-zelqia-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-zelqia-gold hover:border-zelqia-gold cursor-pointer"
                        >
                          Select Image Files
                        </label>
                      </div>

                      {v.images.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {v.images.map((img, iIdx) => (
                            <div key={iIdx} className="relative w-20 h-20 border border-zelqia-border group">
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(vIdx, iIdx)}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg font-sans font-semibold py-4 text-xs uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Vault...' : editingProductId ? 'Update Product Changes' : 'Publish Product to Live Website'}
            </button>
          </form>

          {/* Product Inventory Table */}
          <div>
            <h2 className="font-serif text-2xl text-zelqia-ivory uppercase tracking-wider mb-6">
              Live Catalogue ({products.length} Products)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p._id} className="bg-zelqia-card border border-zelqia-border/30 p-4 flex gap-4 items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <img
                      src={p.variants[0]?.images[0] || 'https://via.placeholder.com/80'}
                      alt={p.title}
                      className="w-16 h-16 object-cover border border-zelqia-border/40"
                    />
                    <div>
                      <h4 className="font-serif text-base text-zelqia-ivory line-clamp-1">{p.title}</h4>
                      <span className="text-xs text-zelqia-gold font-sans font-semibold">
                        ₹{p.variants[0]?.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-zelqia-muted block">
                        {p.variants.length} Metal Variant(s) • {p.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditProduct(p)}
                      className="text-zelqia-gold hover:text-zelqia-goldLight p-2"
                      title="Edit Product"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="text-zelqia-muted hover:text-red-400 p-2"
                      title="Delete Product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: STYLED BY YOU */}
      {activeTab === 'ugc' && (
        <div className="bg-zelqia-card border border-zelqia-border/50 p-6 md:p-8 rounded-sm shadow-2xl">
          <h2 className="font-serif text-xl text-zelqia-gold uppercase tracking-wider mb-6 flex items-center gap-2">
            <Instagram size={18} /> Manage "Styled by You" Photos & Reels
          </h2>

          <form onSubmit={handleUgcSubmit} className="mb-10 bg-zelqia-cardElevated p-5 border border-zelqia-border/40">
            <h3 className="text-xs uppercase tracking-widest text-zelqia-ivory mb-4 font-semibold">
              Add New Instagram Reel or Photo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zelqia-muted block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 18K Gold Solitaire Choker"
                  value={ugcTitle}
                  onChange={(e) => setUgcTitle(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zelqia-muted block mb-1">Media Type</label>
                <select
                  value={ugcMediaType}
                  onChange={(e) => setUgcMediaType(e.target.value)}
                  className="w-full bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                >
                  <option value="IMAGE">📷 Photo Post</option>
                  <option value="REEL">🎥 Instagram Reel / Video (MP4)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zelqia-muted block mb-1">Instagram Handle</label>
                <input
                  type="text"
                  disabled
                  value="@zelqia_jewels"
                  className="w-full bg-zelqia-bg/50 border border-zelqia-border p-2.5 text-xs text-zelqia-gold outline-none"
                />
              </div>
            </div>

            <div
              onPaste={(e) => {
                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                for (let item of items) {
                  if (item.type.indexOf('image') !== -1 || item.type.indexOf('video') !== -1) {
                    processImageFile(item.getAsFile(), (base64) => setUgcImage(base64));
                  }
                }
              }}
              tabIndex="0"
              className="border-2 border-dashed border-zelqia-border/80 hover:border-zelqia-gold p-6 text-center bg-zelqia-bg outline-none mb-4 cursor-pointer transition-colors"
            >
              {ugcImage ? (
                <div className="relative inline-block">
                  {ugcMediaType === 'REEL' || ugcImage.startsWith('data:video') ? (
                    <video src={ugcImage} className="w-28 h-44 object-cover border border-zelqia-border" autoPlay loop muted />
                  ) : (
                    <img src={ugcImage} alt="preview" className="w-28 h-36 object-cover border border-zelqia-border" />
                  )}
                  <button
                    type="button"
                    onClick={() => setUgcImage('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={22} className="mx-auto text-zelqia-gold mb-2" />
                  <p className="text-xs text-zelqia-ivory font-medium">
                    Click & press <kbd className="bg-zelqia-card px-1.5 py-0.5 text-zelqia-gold border border-zelqia-border">Ctrl + V</kbd> to paste photo or video
                  </p>
                  <p className="text-[10px] text-zelqia-muted mt-1">or browse files (MP4, JPG, PNG)</p>

                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        processImageFile(e.target.files[0], (base64) => setUgcImage(base64));
                      }
                    }}
                    className="hidden"
                    id="ugc-file-upload"
                  />
                  <label
                    htmlFor="ugc-file-upload"
                    className="mt-3 inline-block bg-zelqia-card border border-zelqia-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-zelqia-gold hover:border-zelqia-gold cursor-pointer"
                  >
                    Select Reel / Photo File
                  </label>
                </>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg font-sans font-semibold py-3 text-xs uppercase tracking-widest transition-all shadow-lg"
            >
              + Publish Reel/Photo to Live "Styled By You"
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ugcPosts.map((post) => (
              <div key={post._id} className="relative aspect-[9/16] md:aspect-[4/5] bg-zelqia-bg border border-zelqia-border overflow-hidden group">
                {post.mediaType === 'REEL' || post.mediaUrl?.startsWith('data:video') || post.image?.startsWith('data:video') ? (
                  <video src={post.mediaUrl || post.image} className="w-full h-full object-cover" muted loop autoPlay />
                ) : (
                  <img src={post.mediaUrl || post.image} alt={post.title} className="w-full h-full object-cover" />
                )}

                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <span className="text-xs text-zelqia-gold font-sans">{post.handle || '@zelqia_jewels'}</span>
                  <p className="font-serif text-xs text-zelqia-ivory line-clamp-2">{post.title}</p>
                  <button
                    onClick={() => handleDeleteUgc(post._id)}
                    className="bg-red-500/80 hover:bg-red-500 text-white text-[10px] uppercase tracking-wider py-1.5 px-2 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} /> Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}