import { describe, expect, it } from "vitest";
import { selectLibraryCards, type SkillNode } from "../packages/taxonomy/src/index.js";
const skill = (id: string, kind: SkillNode["kind"] = "skill"): SkillNode => ({id, kind, name: id, slug: id, parentId: null, tags: []});

describe("library card selection", () => {
  it("excludes empty skills and non-skill nodes before limiting populated cards", () => {
    const empty = Array.from({length: 30}, (_, i) => skill(`empty-${i}`));
    const populated = Array.from({length: 30}, (_, i) => skill(`custom-${String(i).padStart(2, "0")}`));
    const nodes = [...empty, skill("category", "category"), ...populated.slice().reverse()];
    const counts = new Map([...populated.map((node) => [node.id, 3] as const), ["category", 10] as const]);
    const cards = selectLibraryCards(nodes, counts);
    expect(cards.map((card) => card.skill.id)).toEqual(populated.slice(0, 25).map((node) => node.id));
    expect(cards.every((card) => card.questionCount === 3)).toBe(true);
    expect(nodes[0]?.id).toBe("empty-0");
  });
  it("returns fewer cards honestly when only one skill has content", () => {
    const nodes = [skill("empty"), skill("custom")];
    expect(selectLibraryCards(nodes, new Map())).toEqual([]);
    expect(selectLibraryCards(nodes, new Map([["custom", 2]]))).toEqual([{skill: nodes[1], questionCount: 2}]);
  });
});
