'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Charity } from '@/lib/types'
import { StaggerContainer, StaggerItem, HoverGlow } from '@/components/Motion'

export default function CharityList({ charities }: { charities: Charity[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'featured'>('all')

  const filtered = useMemo(() => charities.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.is_featured
    return matchSearch && matchFilter
  }), [charities, search, filter])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <input type="text" placeholder="Search charities…" value={search} onChange={e => setSearch(e.target.value)}
          className="input-cyber flex-1" />
        <div className="flex gap-2">
          {(['all', 'featured'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === f ? 'bg-neon-green text-dark-950' : 'glass border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}>
              {f === 'all' ? 'All' : '⭐ Featured'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">No charities found{search ? ` for "${search}"` : ''}</div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => (
            <StaggerItem key={c.id}>
              <HoverGlow className="h-full">
                <Link href={`/charities/${c.id}`} className="glass flex flex-col h-full hover:border-neon-green/30 transition-colors duration-300">
                  {c.image_url && (
                    <div className="relative h-44 rounded-t-2xl overflow-hidden">
                      <Image src={c.image_url} alt={c.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 to-transparent" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      {c.is_featured && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neon-green/15 text-neon-green border border-neon-green/30 ml-2 shrink-0">Featured</span>}
                    </div>
                    <p className="text-white/50 text-sm flex-1 leading-relaxed">{c.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8 text-sm">
                      <span className="text-white/30">{c.total_supporters} supporters</span>
                      <span className="text-neon-green font-medium">View →</span>
                    </div>
                  </div>
                </Link>
              </HoverGlow>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}
