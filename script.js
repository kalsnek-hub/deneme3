document.addEventListener('DOMContentLoaded', () => {

    const urunVerileri = [];
    // 56 adet örnek ürün oluşturuldu
    for (let i = 1; i <= 56; i++) {
        urunVerileri.push({
            id: i,
            ad: `Royal Delicacy No.${i}`, // Ürün adları döneme uygun
            aciklama: `A fine selection from Her Majesty's kitchen, crafted with utmost care and a touch of history.`, // Açıklama döneme uygun
            fiyat_adet: 25,
            fiyat_kilo: 50,
            kategori: (i <= 12) ? 'tatlilar' :
                       (i <= 24) ? 'tuzlular' :
                       (i <= 36) ? 'kurabiyeler' :
                       (i <= 48) ? 'atistirmaliklar' :
                       'fit-tarifler'
        });
    }

    const slideshowGrid = document.querySelector('.slideshow-grid');
    const slideshowContainer1 = document.getElementById('slideshow-1');
    const slideshowContainer2 = document.getElementById('slideshow-2');
    const slideshowContainer3 = document.getElementById('slideshow-3');
    const urunListelemeAlani = document.getElementById('urun-listeleme-alani');
    const urunListesiContainer = document.getElementById('urun-listesi-container');
    const kategoriBaslik = urunListelemeAlani.querySelector('h2');
    const sepetIkon = document.getElementById('sepet-ikonu');
    const sepetSayac = document.getElementById('sepet-sayaci');
    const sepetModal = document.getElementById('sepet-modal');
    const sepetListesi = document.getElementById('sepet-listesi');
    const siparisTamamlaBtn = document.getElementById('siparis-tamamla-btn');
    const siparisIptalBtn = document.getElementById('siparis-iptal-btn');
    const sepetOzetToplamUrun = document.getElementById('sepet-toplam-urun');
    const sepetOzetToplamTutar = document.getElementById('sepet-toplam-tutar');

    const urunModal = document.getElementById('urun-modal');
    const bilgiModal = document.getElementById('bilgi-modal');
    const siparisGonderForm = document.getElementById('siparis-gonder-form');
    const homeLinks = document.querySelectorAll('#home-link, #title-link');

    let sepet = JSON.parse(localStorage.getItem('sepet')) || {};

    // Sayfa yüklendiğinde sepeti localStorage'dan çek
    sepetiGuncelle();

    // Üçlü slayt gösterisi
    function startSlideshow(container) {
        // Rastgele 10 ürün seç, ürün resimlerinin döneme uygun olduğunu varsayıyoruz.
        const randomImages = [...urunVerileri].sort(() => 0.5 - Math.random()).slice(0, 10);
        container.innerHTML = '';
        randomImages.forEach(urun => {
            const img = document.createElement('img');
            img.src = `images/${urun.id}.jpg`; // Resim yolunuzu kontrol edin
            img.alt = urun.ad;
            container.appendChild(img);
        });
        
        const images = container.querySelectorAll('img');
        let currentIndex = 0;
        if (images.length > 0) {
            images[currentIndex].classList.add('active');

            setInterval(() => {
                images[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add('active');
            }, 4000);
        }
    }
    
    startSlideshow(slideshowContainer1);
    startSlideshow(slideshowContainer2);
    startSlideshow(slideshowContainer3);

    // Ana sayfa butonları ve başlık
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            urunListelemeAlani.style.display = 'none';
            slideshowGrid.style.display = 'flex'; // Slayt gösterisini tekrar göster
        });
    });

    // Kategori menülerini dinleme
    document.querySelectorAll('header nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const kategori = e.target.dataset.kategori;
            const baslik = e.target.innerText; // Menüdeki metni başlık olarak al
            
            slideshowGrid.style.display = 'none'; // Slayt gösterisini gizle
            urunListelemeAlani.style.display = 'block'; // Ürün listeleme alanını göster

            urunleriListele(kategori, baslik);
        });
    });

    // Ürünleri listeleme
    function urunleriListele(kategori, baslik) {
        urunListesiContainer.innerHTML = '';
        kategoriBaslik.innerText = baslik; // Kategori başlığını güncelle
        const filtrelenmisUrunler = urunVerileri.filter(urun => urun.kategori === kategori);

        filtrelenmisUrunler.forEach(urun => {
            const urunElementi = document.createElement('div');
            urunElementi.classList.add('urun');
            urunElementi.setAttribute('data-id', urun.id);
            urunElementi.innerHTML = `
                <img src="images/${urun.id}.jpg" alt="${urun.ad}">
                <div class="bilgi-penceresi">
                    <h3>${urun.ad}</h3>
                    <p>${urun.aciklama}</p>
                </div>
            `;
            urunListesiContainer.appendChild(urunElementi);
        });
    }

    // Ürün kartlarına event delegation ile tıklama dinleyicisi ekleme
    urunListesiContainer.addEventListener('click', (e) => {
        const urunElement = e.target.closest('.urun');
        if (urunElement) {
            const urunId = urunElement.dataset.id;
            const secilenUrun = urunVerileri.find(u => u.id == urunId);
            
            document.getElementById('urun-modal-adi').innerText = secilenUrun.ad;
            document.getElementById('adet-input').value = 1;
            document.getElementById('kilo-input').value = 0.5; // Varsayılan kilo
            
            // Fiyat bilgisi güncellemeleri
            const adetFiyatSpan = document.getElementById('adet-fiyat-span');
            const kiloFiyatSpan = document.getElementById('kilo-fiyat-span');

            adetFiyatSpan.innerText = `${secilenUrun.fiyat_adet.toFixed(2)} TL`;
            kiloFiyatSpan.innerText = `${secilenUrun.fiyat_kilo.toFixed(2)} TL`;
            
            urunModal.style.display = 'block';
            urunModal.querySelector('.add-to-cart-btn').dataset.urunId = urunId;
        }
    });

    // Sepete Ekle
    document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
        const urunId = document.querySelector('.add-to-cart-btn').dataset.urunId;
        const secilenUrun = urunVerileri.find(u => u.id == urunId);
        let miktar;
        let birim;
        let fiyat;
        const aktifTab = document.querySelector('.tab-btn.active').dataset.tab;

        if (aktifTab === 'adet') {
            miktar = parseFloat(document.getElementById('adet-input').value);
            birim = "Adet";
            fiyat = secilenUrun.fiyat_adet * miktar;
        } else {
            miktar = parseFloat(document.getElementById('kilo-input').value);
            birim = "Kilo";
            fiyat = secilenUrun.fiyat_kilo * miktar;
        }

        if (miktar > 0) {
            // Sepete aynı ürün ve birimden ekleniyorsa miktar ve tutarı güncelle
            const sepetUrunAnahtari = `${urunId}-${birim}`; // Benzersiz anahtar
            if (sepet[sepetUrunAnahtari]) {
                sepet[sepetUrunAnahtari].miktar += miktar;
                sepet[sepetUrunAnahtari].tutar += fiyat;
            } else {
                // Yeni ürün veya farklı birimde ekleme
                sepet[sepetUrunAnahtari] = {
                    id: urunId, // Orijinal ürün ID'si
                    ad: secilenUrun.ad,
                    miktar: miktar,
                    birim: birim,
                    tutar: fiyat
                };
            }
            
            sepetiGuncelle();
            urunModal.style.display = 'none';
        } else {
            alert('A valid quantity must be entered, noble customer!');
        }
    });

    // Sepeti güncelleme ve localStorage'a kaydetme
    function sepetiGuncelle() {
        sepetListesi.innerHTML = '';
        const sepetKeys = Object.keys(sepet);
        let toplamTutar = 0;
        let toplamUrunSayisi = 0;

        sepetKeys.forEach(sepetUrunAnahtari => {
            const urun = sepet[sepetUrunAnahtari];
            const li = document.createElement('li');
            li.innerHTML = `${urun.ad} - ${urun.miktar.toFixed(1)} ${urun.birim} (${urun.tutar.toFixed(2)} TL) <button class="sepet-sil-btn" data-key="${sepetUrunAnahtari}">X</button>`;
            sepetListesi.appendChild(li);
            toplamTutar += urun.tutar;
            toplamUrunSayisi++;
        });

        sepetOzetToplamUrun.innerText = toplamUrunSayisi;
        sepetOzetToplamTutar.innerText = toplamTutar.toFixed(2);
        sepetSayac.innerText = toplamUrunSayisi;

        if (toplamUrunSayisi > 0) {
            sepetSayac.style.display = 'block';
        } else {
            sepetSayac.style.display = 'none';
        }

        localStorage.setItem('sepet', JSON.stringify(sepet));
    }

    // Sepette ürün silme (event delegation)
    sepetListesi.addEventListener('click', (e) => {
        if (e.target.classList.contains('sepet-sil-btn')) {
            const sepetUrunAnahtari = e.target.dataset.key; // Data key kullanılıyor
            delete sepet[sepetUrunAnahtari];
            sepetiGuncelle();
        }
    });

    // Sepeti Açma
    sepetIkon.addEventListener('click', () => {
        sepetModal.style.display = 'block';
    });

    // Siparişi İptal Et
    siparisIptalBtn.addEventListener('click', () => {
        sepet = {}; // Sepeti sıfırla
        sepetiGuncelle();
        sepetModal.style.display = 'none';
        alert('Your esteemed order has been gracefully discarded.');
    });

    // Sipariş Tamamlama Modalını Açma
    siparisTamamlaBtn.addEventListener('click', () => {
        if (Object.keys(sepet).length === 0) {
            alert("Your Royal Basket is empty. Please add some noble treats before proceeding.");
            return;
        }
        sepetModal.style.display = 'none';
        bilgiModal.style.display = 'block';
    });

    // Sipariş Formunu Gönderme
    siparisGonderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formObj = Object.fromEntries(new FormData(siparisGonderForm).entries());

        let siparisMetni = "Ordered Items:\n";
        Object.keys(sepet).forEach(sepetUrunAnahtari => {
            const urun = sepet[sepetUrunAnahtari];
            siparisMetni += `- ${urun.ad} - ${urun.miktar.toFixed(1)} ${urun.birim} (${urun.tutar.toFixed(2)} TL)\n`;
        });
        siparisMetni += `\nGrand Total: ${sepetOzetToplamTutar.innerText} TL`;
        
        const templateParams = {
            ...formObj,
            siparis_ozet: siparisMetni
        };

        // Size mail gönderme (Satıcı mail şablonu)
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_SELLER_TEMPLATE_ID', templateParams)
            .then(() => {
                // Müşteriye onay maili gönderme (Müşteri mail şablonu)
                const customerTemplateParams = {
                    ...templateParams,
                    siparis_ozet: siparisMetni,
                    to_email: formObj.email // Müşteri e-posta adresi
                };
                return emailjs.send('YOUR_SERVICE_ID', 'YOUR_CUSTOMER_TEMPLATE_ID', customerTemplateParams);
            })
            .then(() => {
                alert('Your esteemed order has been received! We shall prepare it with the finest care. A confirmation will be dispatched to you shortly. Thank you for choosing The Royal Patisserie.');
                bilgiModal.style.display = 'none';
                siparisGonderForm.reset();
                sepet = {}; // Sepeti sıfırla
                sepetiGuncelle();
            })
            .catch((error) => {
                console.error('An error occurred during the royal order submission:', error);
                alert('A grave error occurred while submitting your order. Pray, try again!');
            });
    });

    // Modal kapatma
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => e.target.closest('.modal').style.display = 'none');
    });

    // Kilo sekmesine tıklandığında aktif hale gelsin
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const activeTab = document.getElementById(btn.dataset.tab + '-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            activeTab.classList.add('active');
        });
    });
});
