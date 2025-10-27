import { describe, it, expect, beforeEach } from 'vitest'
import * as Y from 'yjs'

/**
 * Testes para sincronização Yjs - CRDT para formas colaborativas
 *
 * Testa funcionalidades de:
 * - Sincronização entre múltiplos documentos
 * - Operações em Y.Array (adicionar, atualizar, remover formas)
 * - Resolução de conflitos (CRDT)
 * - Encoding/decoding de updates
 */

describe('Yjs Synchronization', () => {
	describe('basic sync', () => {
		it('should sync arrays between two documents', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const shapes1 = doc1.getArray('shapes')
			const shapes2 = doc2.getArray('shapes')

			// Add shape to doc1
			shapes1.push([
				{
					id: 'shape-1',
					type: 'rect',
					x: 0,
					y: 0,
					width: 100,
					height: 100,
				},
			])

			// Sync doc1 → doc2
			const update = Y.encodeStateAsUpdate(doc1)
			Y.applyUpdate(doc2, update)

			// Check doc2 received update
			expect(shapes2.length).toBe(1)
			expect(shapes2.get(0)).toMatchObject({
				id: 'shape-1',
				type: 'rect',
				x: 0,
				y: 0,
			})
		})

		it('should sync maps between two documents', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const map1 = doc1.getMap('canvasData')
			const map2 = doc2.getMap('canvasData')

			// Set data in doc1
			map1.set('name', 'Test Canvas')
			map1.set('backgroundColor', '#FFFFFF')

			// Sync
			const update = Y.encodeStateAsUpdate(doc1)
			Y.applyUpdate(doc2, update)

			// Check doc2
			expect(map2.get('name')).toBe('Test Canvas')
			expect(map2.get('backgroundColor')).toBe('#FFFFFF')
		})

		it('should handle empty state sync', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const shapes1 = doc1.getArray('shapes')
			const shapes2 = doc2.getArray('shapes')

			// Sync empty state
			const update = Y.encodeStateAsUpdate(doc1)
			Y.applyUpdate(doc2, update)

			expect(shapes1.length).toBe(0)
			expect(shapes2.length).toBe(0)
		})
	})

	describe('concurrent edits', () => {
		it('should handle concurrent additions', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const shapes1 = doc1.getArray('shapes')
			const shapes2 = doc2.getArray('shapes')

			// Both add shapes concurrently (before sync)
			shapes1.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])
			shapes2.push([{ id: 'shape-2', type: 'circle', x: 100, y: 100 }])

			// Sync both ways
			const update1 = Y.encodeStateAsUpdate(doc1)
			const update2 = Y.encodeStateAsUpdate(doc2)

			Y.applyUpdate(doc2, update1)
			Y.applyUpdate(doc1, update2)

			// Both should have all shapes
			expect(shapes1.length).toBe(2)
			expect(shapes2.length).toBe(2)

			// Order might differ, check both are present
			const shapes1Ids = shapes1.toArray().map((s: any) => s.id)
			const shapes2Ids = shapes2.toArray().map((s: any) => s.id)

			expect(shapes1Ids).toContain('shape-1')
			expect(shapes1Ids).toContain('shape-2')
			expect(shapes2Ids).toContain('shape-1')
			expect(shapes2Ids).toContain('shape-2')
		})

		it('should resolve conflicting updates correctly', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const map1 = doc1.getMap('settings')
			const map2 = doc2.getMap('settings')

			// Both set the same key to different values
			map1.set('zoom', 1.5)
			map2.set('zoom', 2.0)

			// Sync both ways
			const update1 = Y.encodeStateAsUpdate(doc1)
			const update2 = Y.encodeStateAsUpdate(doc2)

			Y.applyUpdate(doc2, update1)
			Y.applyUpdate(doc1, update2)

			// Both should converge to the same value (CRDT guarantees)
			expect(map1.get('zoom')).toBe(map2.get('zoom'))
		})
	})

	describe('shape operations', () => {
		let doc: Y.Doc
		let shapes: Y.Array<any>

		beforeEach(() => {
			doc = new Y.Doc()
			shapes = doc.getArray('shapes')
		})

		it('should add multiple shapes', () => {
			shapes.push([
				{ id: 'shape-1', type: 'rect', x: 0, y: 0 },
				{ id: 'shape-2', type: 'circle', x: 100, y: 100 },
				{ id: 'shape-3', type: 'text', x: 200, y: 200 },
			])

			expect(shapes.length).toBe(3)
			expect(shapes.get(0).id).toBe('shape-1')
			expect(shapes.get(1).id).toBe('shape-2')
			expect(shapes.get(2).id).toBe('shape-3')
		})

		it('should update shape at index', () => {
			shapes.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])

			// Update by deleting and reinserting
			const updated = { ...shapes.get(0), x: 50, y: 50 }
			shapes.delete(0, 1)
			shapes.insert(0, [updated])

			expect(shapes.get(0)).toMatchObject({
				id: 'shape-1',
				x: 50,
				y: 50,
			})
		})

		it('should remove shape by index', () => {
			shapes.push([
				{ id: 'shape-1', type: 'rect', x: 0, y: 0 },
				{ id: 'shape-2', type: 'circle', x: 100, y: 100 },
			])

			shapes.delete(0, 1)

			expect(shapes.length).toBe(1)
			expect(shapes.get(0).id).toBe('shape-2')
		})

		it('should find shape by id', () => {
			shapes.push([
				{ id: 'shape-1', type: 'rect', x: 0, y: 0 },
				{ id: 'shape-2', type: 'circle', x: 100, y: 100 },
				{ id: 'shape-3', type: 'text', x: 200, y: 200 },
			])

			const shapesArray = shapes.toArray()
			const found = shapesArray.findIndex((s: any) => s.id === 'shape-2')

			expect(found).toBe(1)
			expect(shapesArray[found]).toMatchObject({
				id: 'shape-2',
				type: 'circle',
			})
		})
	})

	describe('binary encoding', () => {
		it('should encode and decode updates as Uint8Array', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const shapes1 = doc1.getArray('shapes')

			shapes1.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])

			// Encode as binary
			const update = Y.encodeStateAsUpdate(doc1)
			expect(update).toBeInstanceOf(Uint8Array)

			// Decode in doc2
			Y.applyUpdate(doc2, update)
			const shapes2 = doc2.getArray('shapes')

			expect(shapes2.length).toBe(1)
			expect(shapes2.get(0)).toMatchObject({
				id: 'shape-1',
				type: 'rect',
			})
		})

		it('should handle multiple sequential updates', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const shapes1 = doc1.getArray('shapes')
			const shapes2 = doc2.getArray('shapes')

			// Update 1: Add shape
			shapes1.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])
			const update1 = Y.encodeStateAsUpdate(doc1)
			Y.applyUpdate(doc2, update1)

			// Update 2: Add another shape
			shapes1.push([{ id: 'shape-2', type: 'circle', x: 100, y: 100 }])
			const update2 = Y.encodeStateAsUpdate(doc1)
			Y.applyUpdate(doc2, update2)

			// Update 3: Remove first shape
			shapes1.delete(0, 1)
			const update3 = Y.encodeStateAsUpdate(doc1)
			Y.applyUpdate(doc2, update3)

			expect(shapes2.length).toBe(1)
			expect(shapes2.get(0).id).toBe('shape-2')
		})
	})

	describe('state vector sync', () => {
		it('should use state vectors for efficient sync', () => {
			const doc1 = new Y.Doc()
			const doc2 = new Y.Doc()

			const shapes1 = doc1.getArray('shapes')

			// Add initial shapes and sync
			shapes1.push([{ id: 'shape-1', type: 'rect', x: 0, y: 0 }])
			let update = Y.encodeStateAsUpdate(doc1)
			Y.applyUpdate(doc2, update)

			// Add more shapes to doc1
			shapes1.push([
				{ id: 'shape-2', type: 'circle', x: 100, y: 100 },
				{ id: 'shape-3', type: 'text', x: 200, y: 200 },
			])

			// Get state vector from doc2 (what it has)
			const stateVector = Y.encodeStateVector(doc2)

			// Get only diff between doc1 and doc2's state
			const diff = Y.encodeStateAsUpdate(doc1, stateVector)

			// Apply diff
			Y.applyUpdate(doc2, diff)

			const shapes2 = doc2.getArray('shapes')
			expect(shapes2.length).toBe(3)
		})
	})
})
