<script lang="ts">
  let { emoji, label, badgeClass, title, entryCount, onClose }: {
    emoji: string
    label: string
    badgeClass: string
    title: string
    entryCount: string
    onClose: () => void
  } = $props()
</script>

<div class="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-[#1e2535] bg-[#0d1220ee] backdrop-blur-[8px]">
  <span class="text-[0.72rem] font-bold tracking-[1.5px] uppercase px-[0.6rem] py-[0.2rem] rounded-full {badgeClass}">{emoji} {label}</span>
  <button class="bg-transparent border-none text-[#475569] text-[0.9rem] cursor-pointer px-2 py-1 rounded hover:text-[#94a3b8]" onclick={onClose}>✕</button>
</div>
<div class="text-[1.1rem] font-extrabold text-[#e2e8f0] px-5 pt-4 pb-1 leading-tight">{title}</div>
<div class="text-[0.72rem] text-[#475569] px-5 pb-3 tracking-[1px] uppercase">{entryCount}</div>
