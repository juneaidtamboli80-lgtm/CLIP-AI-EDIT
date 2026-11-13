'use client'

import { Languages, SlidersHorizontal, Type } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CaptionsPanel } from '@/components/editor/captions-panel'
import { SubtitlesPanel } from '@/components/editor/subtitles-panel'
import { AdjustPanel } from '@/components/editor/adjust-panel'
import { getPreset } from '@/lib/caption-presets'
import type { EditorState } from '@/lib/editor'
import { DEFAULT_CAPTION_TEXT } from '@/lib/editor'

export function PropertiesPanel({
  state,
  update,
  onResetTrims,
}: {
  state: EditorState
  update: (patch: Partial<EditorState>) => void
  onResetTrims: () => void
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Tabs defaultValue="captions" className="flex h-full flex-col">
        <div className="shrink-0 border-b border-border/60 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold">Properties</h2>
            <span className="rounded-md bg-secondary/70 px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground">
              {getPreset(state.captionSettings.presetId).name}
            </span>
          </div>
          <TabsList className="mt-2.5 w-full">
            <TabsTrigger value="captions" className="flex-1">
              <Type className="h-3 w-3" /> Captions
            </TabsTrigger>
            <TabsTrigger value="subtitles" className="flex-1">
              <Languages className="h-3 w-3" /> Subtitles
            </TabsTrigger>
            <TabsTrigger value="adjust" className="flex-1">
              <SlidersHorizontal className="h-3 w-3" /> Adjust
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <TabsContent value="captions">
            <CaptionsPanel
              state={state}
              update={update}
              onReset={() =>
                update({
                  captionText: DEFAULT_CAPTION_TEXT,
                  captionSettings: getPreset('hormozi').settings,
                })
              }
            />
          </TabsContent>
          <TabsContent value="subtitles">
            <SubtitlesPanel state={state} update={update} />
          </TabsContent>
          <TabsContent value="adjust">
            <AdjustPanel state={state} update={update} onResetTrims={onResetTrims} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
