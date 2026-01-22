function MainModule(listingsID = '#listings') {
  const me = {};
  const listingsElement = document.querySelector(listingsID);
  let currentListings = [];

  // handles Details clicks
  listingsElement.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-details');
    if (!btn) return;
    e.preventDefault();
    const idx = parseInt(btn.dataset.index, 10);
    const listing = currentListings[idx];
    if (!listing) return;
    const modalEl = document.getElementById('details-modal');
    const modalTitle = document.getElementById('details-modal-label');
    const modalBody = document.getElementById('details-modal-body');
    modalTitle.textContent = parseListingName(listing.name)[0] || 'Details';
    const hostName = listing.host_name || 'Host';
    const hostThumb =
      listing.host_thumbnail_url || listing.host_picture_url || '';
    const mainPic = listing.picture_url || '';

    // Parse amenities
    let amenities = [];
    if (Array.isArray(listing.amenities)) {
      amenities = listing.amenities;
    } else if (typeof listing.amenities === 'string') {
      try {
        amenities = JSON.parse(listing.amenities);
      } catch (err) {
        amenities = listing.amenities
          .replace(/^\[|\]$/g, '')
          .split(/",\s*"|",\s*'|',\s*"|',\s*'/)
          .map((s) => s.replace(/^\"|\"$|^\'|\'$/g, ''))
          .filter(Boolean);
      }
    }

    const amenitiesHtml = amenities.length
      ? `<div class="mt-2"><strong>Amenities:</strong> <br> ${amenities
          .slice(0, 12)
          .map(
            (a) =>
              `<span class="badge bg-light text-dark me-1 mb-1">${a}</span>`,
          )
          .join('')}</div>`
      : '';

    modalBody.innerHTML = `
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-5 mb-3">
              ${mainPic ? `<img src="${mainPic}" alt="listing" class="modal-listing-img img-fluid"/>` : ''}
            </div>
            <div class="col-md-7">
              <div class="d-flex align-items-center mb-2">
                ${hostThumb ? `<img src="${hostThumb}" alt="host" class="host-thumb me-2"/>` : ''}
                <div>
                  <div><strong>${hostName}</strong></div>
                  <div class="text-muted small">${listing.host_location || ''}</div>
                </div>
              </div>
              <div>${listing.description || '(no description)'}</div>
              ${amenitiesHtml}
            </div>
          </div>
        </div>
      `;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  });

  // Helper function to parse listing name into 3 parts
  function parseListingName(name) {
    if (!name) return ['', '', ''];
    const parts = name.split(' · ');
    if (parts.length < 3) {
      return [parts[0] || '', parts[1] || '', parts.slice(2).join(' · ')];
    }
    return [parts[0], parts[1], parts.slice(2).join(' · ')];
  }

  function getListingCode(listing, i) {
    const [title, rating, details] = parseListingName(listing.name);
    return `<div class="col-4">
    <div class="listing card">
      <img
        src="${listing.picture_url}"
        class="card-img-top"
        alt="Listing picture"
      />
      <div class="card-body">
        <h2 class="card-title">${title}</h2>
        <div>${listing.price} | ${rating}</div>
        <p class="card-title-details">
          ${details}
        </p>
        <div class="card-actions d-flex justify-content-end mt-2">
          <a href="#" data-index="${i}" class="btn btn-secondary me-2 btn-details">Details</a>
          <a href="#" class="btn btn-primary">Book</a>
        </div>
      </div>
    </div>
  </div>
  `;
  }

  function redraw(listings) {
    listingsElement.innerHTML = '';
    listingsElement.innerHTML = listings.map(getListingCode).join('\n');
  }

  async function loadData() {
    const res = await fetch('./airbnb_sf_listings_500.json');
    const listings = await res.json();

    currentListings = listings.slice(0, 50);
    me.redraw(currentListings);
  }

  me.redraw = redraw;
  me.loadData = loadData;

  return me;
}

const main = MainModule();

main.loadData();
