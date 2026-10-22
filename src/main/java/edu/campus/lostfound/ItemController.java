package edu.campus.lostfound;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final ItemRepository repository;

    public ItemController(ItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Item> getItems(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) String q) {
        List<Item> items = type == null ? repository.findAll() : repository.findByType(type);
        if (q == null || q.isBlank()) return items;
        String query = q.trim().toLowerCase(Locale.ROOT);
        return items.stream().filter(item ->
                contains(item.getName(), query) ||
                contains(item.getCategory(), query) ||
                contains(item.getLocation(), query) ||
                contains(item.getDescription(), query))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Item getItem(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item createItem(@Valid @RequestBody Item item) {
        item.setStatus(ItemStatus.OPEN);
        item.setDateReported(item.getDateReported() == null ? java.time.LocalDate.now() : item.getDateReported());
        return repository.save(item);
    }

    @PatchMapping("/{id}/resolve")
    public Item resolveItem(@PathVariable Long id) {
        Item item = getItem(id);
        item.setStatus(ItemStatus.RESOLVED);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
        }
        repository.deleteById(id);
    }

    @GetMapping("/matches")
    public List<Map<String, Object>> getMatches() {
        List<Item> lost = repository.findByType(ItemType.LOST).stream()
                .filter(i -> i.getStatus() == ItemStatus.OPEN).toList();
        List<Item> found = repository.findByType(ItemType.FOUND).stream()
                .filter(i -> i.getStatus() == ItemStatus.OPEN).toList();

        List<Map<String, Object>> matches = new ArrayList<>();
        for (Item l : lost) {
            for (Item f : found) {
                int score = 0;
                if (same(l.getName(), f.getName())) score += 3;
                else if (contains(l.getName(), f.getName().toLowerCase(Locale.ROOT)) ||
                         contains(f.getName(), l.getName().toLowerCase(Locale.ROOT))) score += 2;
                if (same(l.getCategory(), f.getCategory())) score += 2;
                if (same(l.getLocation(), f.getLocation())) score += 1;
                if (score >= 3) {
                    Map<String, Object> match = new LinkedHashMap<>();
                    match.put("score", score);
                    match.put("lost", l);
                    match.put("found", f);
                    match.put("reason", "Names, categories, and locations are compared. Please verify manually.");
                    matches.add(match);
                }
            }
        }
        matches.sort((a, b) -> Integer.compare((Integer) b.get("score"), (Integer) a.get("score")));
        return matches;
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private boolean same(String a, String b) {
        return a != null && b != null && a.trim().equalsIgnoreCase(b.trim());
    }
}
