'use client';

export default function FilterPanel({
  searchTerm, setSearchTerm,
  selectedCountry, setSelectedCountry,
  maxValue, setMaxValue,
  maxDays, setMaxDays,
  viewMode, setViewMode,
  sortBy, setSortBy,
  savedCount,
  strings,
}) {
  return (
    <div style={{
      backgroundColor: '#1e2640',
      border: '1px solid #2e3d5e',
      borderRadius: '10px',
      padding: '16px',
      marginBottom: '20px',
    }}>
      {/* Search */}
      <input
        type="text"
        placeholder={strings.search}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          backgroundColor: '#151b2e',
          border: '1px solid #2e3d5e',
          borderRadius: '8px',
          color: '#e8eaf0',
          fontSize: '14px',
          boxSizing: 'border-box',
          marginBottom: '14px',
          outline: 'none',
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {/* Country */}
        <div>
          <label style={{ fontSize: '11px', color: '#6b7a99', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {strings.country}
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#151b2e',
              border: '1px solid #2e3d5e',
              borderRadius: '6px',
              color: '#e8eaf0',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <option value="all">{strings.allCountries}</option>
            <option value="panama">🇵🇦 Panamá</option>
            <option value="costa_rica">🇨🇷 Costa Rica</option>
            <option value="nicaragua">🇳🇮 Nicaragua</option>
            <option value="el_salvador">🇸🇻 El Salvador</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label style={{ fontSize: '11px', color: '#6b7a99', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {strings.sortBy}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#151b2e',
              border: '1px solid #2e3d5e',
              borderRadius: '6px',
              color: '#e8eaf0',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <option value="deadline_asc">{strings.sortDeadline}</option>
            <option value="value_desc">{strings.sortValueDesc}</option>
            <option value="value_asc">{strings.sortValueAsc}</option>
            <option value="urgency">{strings.sortUrgency}</option>
          </select>
        </div>

        {/* Max Value */}
        <div>
          <label style={{ fontSize: '11px', color: '#6b7a99', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {strings.maxValue}: ${(maxValue / 1000).toFixed(0)}K
          </label>
          <input
            type="range"
            min="0"
            max="1000000"
            step="50000"
            value={maxValue}
            onChange={(e) => setMaxValue(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#3b9eff' }}
          />
        </div>

        {/* Max Days */}
        <div>
          <label style={{ fontSize: '11px', color: '#6b7a99', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {strings.deadline}: ≤ {maxDays} {strings.days}
          </label>
          <input
            type="range"
            min="1"
            max="365"
            value={maxDays}
            onChange={(e) => setMaxDays(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#3b9eff' }}
          />
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <button
          onClick={() => setViewMode('all')}
          style={{
            flex: 1,
            padding: '9px',
            backgroundColor: viewMode === 'all' ? '#0055b3' : '#2a3550',
            border: 'none',
            borderRadius: '6px',
            color: viewMode === 'all' ? '#fff' : '#9ba8c0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'background-color 0.15s',
          }}
        >
          🔍 {strings.all}
        </button>
        <button
          onClick={() => setViewMode('saved')}
          style={{
            flex: 1,
            padding: '9px',
            backgroundColor: viewMode === 'saved' ? '#0055b3' : '#2a3550',
            border: 'none',
            borderRadius: '6px',
            color: viewMode === 'saved' ? '#fff' : '#9ba8c0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'background-color 0.15s',
          }}
        >
          ⭐ {strings.saved} ({savedCount})
        </button>
      </div>
    </div>
  );
}
