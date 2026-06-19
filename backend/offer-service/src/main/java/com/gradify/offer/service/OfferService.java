package com.gradify.offer.service;

import com.gradify.offer.sparql.SparqlClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OfferService {

    private final SparqlClient sparqlClient;

    public OfferService(SparqlClient sparqlClient) {
        this.sparqlClient = sparqlClient;
    }

    public Map<String, Object> search(String skill, String company, String program, String city, int page, int size) {
        StringBuilder filters = new StringBuilder();

        if (skill != null && !skill.isBlank()) {
            filters.append(String.format("""
                    ?offre lod:requiresSkill ?skillF .
                    ?skillF skos:prefLabel "%s"@fr .
                    """, skill));
        }
        if (city != null && !city.isBlank()) {
            filters.append(String.format("FILTER (?ville = \"%s\")\n", city));
        }
        if (company != null && !company.isBlank()) {
            filters.append(String.format("FILTER (CONTAINS(LCASE(?entreprise), LCASE(\"%s\")))\n", company));
        }

        String query = String.format("""
                SELECT DISTINCT ?offre ?titre ?entreprise ?ville ?duree ?niveau ?compensation
                WHERE {
                    ?offre a lod:InternshipOffer ;
                           schema:title ?titre ;
                           lod:postedBy ?comp ;
                           schema:jobLocation ?ville ;
                           lod:durationMonths ?duree ;
                           lod:levelRequired ?niveau ;
                           lod:compensation ?compensation ;
                           lod:status "Ouverte"@fr .
                    ?comp schema:name ?entreprise .
                    %s
                }
                ORDER BY ?ville ?titre
                LIMIT %d OFFSET %d
                """, filters, size, (page - 1) * size);

        List<Map<String, String>> results = sparqlClient.query(query);

        List<Map<String, Object>> items = results.stream().map(row -> {
            Map<String, Object> offer = new HashMap<>(row);
            String offerId = row.get("offre").split("/")[row.get("offre").split("/").length - 1];
            offer.put("id", offerId);
            offer.put("title", row.get("titre"));
            offer.put("company", row.get("entreprise"));
            offer.put("city", row.get("ville"));
            offer.put("duration", row.get("duree"));
            offer.put("level", row.get("niveau"));
            offer.put("compensation", row.get("compensation"));
            offer.put("status", "Ouverte");
            offer.put("skills", getOfferSkills(offerId));
            return offer;
        }).collect(Collectors.toList());

        return Map.of("items", items, "page", page, "size", size);
    }

    public Map<String, Object> getById(String offerId) {
        String uri = "https://data.lod-school.ma/id/" + offerId;
        String query = String.format("""
                SELECT ?titre ?entreprise ?secteur ?ville
                       ?debut ?fin ?duree ?niveau ?compensation ?statut ?description ?programmes
                WHERE {
                    <%s> a lod:InternshipOffer ;
                         schema:title ?titre ;
                         lod:postedBy ?comp ;
                         schema:jobLocation ?ville ;
                         schema:jobStartDate ?debut ;
                         schema:jobEndDate ?fin ;
                         lod:durationMonths ?duree ;
                         lod:levelRequired ?niveau ;
                         lod:compensation ?compensation ;
                         lod:status ?statut .
                    OPTIONAL { <%s> schema:description ?description . }
                    OPTIONAL { <%s> lod:targetPrograms ?programmes . }
                    ?comp schema:name ?entreprise .
                    OPTIONAL { ?comp lod:sector ?secteur . }
                }
                LIMIT 1
                """, uri, uri, uri);

        List<Map<String, String>> results = sparqlClient.query(query);
        if (results.isEmpty()) return null;

        Map<String, String> row = results.get(0);
        Map<String, Object> offer = new HashMap<>();
        offer.put("id", offerId);
        offer.put("title", row.get("titre"));
        offer.put("company", row.get("entreprise"));
        offer.put("companySector", row.get("secteur"));
        offer.put("city", row.get("ville"));
        offer.put("startDate", row.get("debut"));
        offer.put("endDate", row.get("fin"));
        offer.put("duration", row.get("duree"));
        offer.put("level", row.get("niveau"));
        offer.put("compensation", row.get("compensation"));
        offer.put("status", row.get("statut"));
        offer.put("description", row.get("description"));
        offer.put("targetPrograms", row.get("programmes"));
        offer.put("skills", getOfferSkillsDetailed(offerId));

        return offer;
    }

    public Map<String, Object> getFilters() {
        List<Map<String, String>> skills = sparqlClient.query("""
                SELECT DISTINCT ?competence WHERE {
                    ?offre lod:requiresSkill ?skill .
                    ?skill skos:prefLabel ?competence .
                    FILTER (lang(?competence) = "fr")
                } ORDER BY ?competence
                """);

        List<Map<String, String>> cities = sparqlClient.query("""
                SELECT DISTINCT ?ville WHERE {
                    ?s a lod:InternshipOffer ; schema:jobLocation ?ville .
                } ORDER BY ?ville
                """);

        List<Map<String, String>> companies = sparqlClient.query("""
                SELECT DISTINCT ?entreprise WHERE {
                    ?offre lod:postedBy ?comp . ?comp schema:name ?entreprise .
                } ORDER BY ?entreprise
                """);

        List<Map<String, String>> programs = sparqlClient.query("""
                SELECT DISTINCT ?filiere WHERE {
                    ?prog a lod:Program ; rdfs:label ?filiere .
                } ORDER BY ?filiere
                """);

        return Map.of(
                "skills", skills.stream().map(r -> r.get("competence")).collect(Collectors.toList()),
                "cities", cities.stream().map(r -> r.get("ville")).collect(Collectors.toList()),
                "companies", companies.stream().map(r -> r.get("entreprise")).collect(Collectors.toList()),
                "programs", programs.stream().map(r -> r.get("filiere")).collect(Collectors.toList())
        );
    }

    private List<String> getOfferSkills(String offerId) {
        String uri = "https://data.lod-school.ma/id/" + offerId;
        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT ?competence WHERE {
                    <%s> lod:requiresSkill ?skill .
                    ?skill skos:prefLabel ?competence .
                    FILTER (lang(?competence) = "fr")
                }
                """, uri));
        return results.stream().map(r -> r.get("competence")).collect(Collectors.toList());
    }

    private List<Map<String, String>> getOfferSkillsDetailed(String offerId) {
        String uri = "https://data.lod-school.ma/id/" + offerId;
        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT ?competence ?categorie WHERE {
                    <%s> lod:requiresSkill ?skill .
                    ?skill skos:prefLabel ?competence ;
                           skos:broader ?cat .
                    ?cat skos:prefLabel ?categorie .
                    FILTER (lang(?competence) = "fr")
                    FILTER (lang(?categorie) = "fr")
                } ORDER BY ?categorie
                """, uri));
        return results.stream().map(r -> Map.of("name", r.get("competence"), "category", r.get("categorie"))).collect(Collectors.toList());
    }

    public Map<String, Object> createOffer(Map<String, Object> data) {
        String id = "offer-" + String.format("%03d", System.currentTimeMillis() % 1000);
        String title = (String) data.getOrDefault("title", "Stage");
        String description = (String) data.getOrDefault("description", "");
        String city = (String) data.getOrDefault("city", "Casablanca");
        String duration = String.valueOf(data.getOrDefault("duration", 3));
        String level = (String) data.getOrDefault("level", "2A");
        String compensation = (String) data.getOrDefault("compensation", "Non remunere");
        String startDate = (String) data.getOrDefault("startDate", java.time.LocalDate.now().toString());
        String endDate = (String) data.getOrDefault("endDate", java.time.LocalDate.now().plusMonths(3).toString());
        String targetPrograms = (String) data.getOrDefault("targetPrograms", "");
        String companyId = (String) data.getOrDefault("companyId", "unknown");
        List<String> skills = data.get("skills") instanceof List ? (List<String>) data.get("skills") : List.of();

        List<Map<String, String>> companyLookup = sparqlClient.query(String.format("""
            SELECT ?comp WHERE {
                ?comp a lod:Company ;
                      schema:name ?name .
                FILTER (LCASE(str(?name)) = LCASE("%s"))
            } LIMIT 1
            """, companyId));
        String companyUri;
        if (!companyLookup.isEmpty()) {
            companyUri = "<" + companyLookup.get(0).get("comp") + ">";
        } else {
            String companyHash = java.util.UUID.nameUUIDFromBytes(companyId.getBytes()).toString().substring(0, 12);
            companyUri = "base:company-" + companyHash;
        }

        for (String skill : skills) {
            String skillHash = java.util.UUID.nameUUIDFromBytes(skill.toLowerCase().getBytes()).toString().substring(0, 12);
            sparqlClient.update(String.format("""
                INSERT DATA {
                    base:skill-%s a skos:Concept ;
                        skos:prefLabel "%s"@fr ;
                        skos:inScheme base:skill-scheme .
                }
                """, skillHash, skill));
        }

        String sparql = String.format("""
            INSERT DATA {
                base:%s a lod:InternshipOffer, schema:JobPosting ;
                    dcterms:identifier "%s"^^xsd:string ;
                    dcterms:created "%s"^^xsd:date ;
                    schema:title "%s"@fr ;
                    schema:description "%s"@fr ;
                    schema:jobLocation "%s" ;
                    schema:jobStartDate "%s"^^xsd:date ;
                    schema:jobEndDate "%s"^^xsd:date ;
                    lod:durationMonths %s ;
                    lod:levelRequired "%s" ;
                    lod:compensation "%s"@fr ;
                    lod:status "Ouverte"@fr ;
                    lod:targetPrograms "%s"@fr ;
                    lod:postedBy %s .
            }
            """, id, id, java.time.LocalDate.now().toString(), title, description, city,
                startDate, endDate, duration, level, compensation, targetPrograms,
                companyUri);

        sparqlClient.update(sparql);

        for (String skill : skills) {
            String skillHash = java.util.UUID.nameUUIDFromBytes(skill.toLowerCase().getBytes()).toString().substring(0, 12);
            sparqlClient.update(String.format("INSERT DATA { base:%s lod:requiresSkill base:skill-%s . }", id, skillHash));
        }

        data.put("id", id);
        data.put("status", "Ouverte");
        return data;
    }

    public Map<String, Object> updateOffer(Map<String, Object> data) {
        String id = (String) data.get("id");
        deleteOffer(id);
        return createOffer(data);
    }

    public void deleteOffer(String offerId) {
        String sparql = String.format("""
            DELETE WHERE {
                base:%s ?p ?o .
            }
            """, offerId);
        sparqlClient.update(sparql);
    }

    public Map<String, Object> getByCompany(String companyId) {
        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT ?offre ?titre ?ville ?duree ?niveau ?compensation ?statut
                WHERE {
                    ?offre a lod:InternshipOffer ;
                           schema:title ?titre ;
                           lod:postedBy ?comp ;
                           schema:jobLocation ?ville ;
                           lod:durationMonths ?duree ;
                           lod:levelRequired ?niveau ;
                           lod:compensation ?compensation ;
                           lod:status ?statut .
                    ?comp schema:name ?entreprise .
                    FILTER (LCASE(str(?entreprise)) = LCASE("%s"))
                }
                ORDER BY ?titre
                """, companyId));

        List<Map<String, Object>> items = results.stream().map(row -> {
            Map<String, Object> offer = new HashMap<>(row);
            String uri = row.get("offre");
            String offerId = uri.substring(uri.lastIndexOf('/') + 1);
            offer.put("id", offerId);
            offer.put("title", row.get("titre"));
            offer.put("city", row.get("ville"));
            offer.put("duration", row.get("duree"));
            offer.put("level", row.get("niveau"));
            offer.put("status", row.get("statut"));
            offer.put("compensation", row.get("compensation"));
            offer.put("skills", getOfferSkills(offerId));
            try {
                Map<String, Object> apps = getApplications(offerId);
                offer.put("applications", ((List<?>) apps.get("items")).size());
            } catch (Exception e) {
                offer.put("applications", 0);
            }
            return offer;
        }).collect(Collectors.toList());

        return Map.of("items", items);
    }

    public void applyToOffer(String offerId, String studentId) {
        String date = java.time.LocalDate.now().toString();
        String sparql = String.format("""
            INSERT DATA {
                base:%s lod:appliedTo base:%s .
                base:%s lod:hasApplication [
                    lod:applicant base:%s ;
                    lod:applicationDate "%s"^^xsd:date ;
                    lod:applicationStatus "En attente"@fr
                ] .
            }
            """, studentId, offerId, offerId, studentId, date);
        sparqlClient.update(sparql);
    }

    public Map<String, Object> getApplications(String offerId) {
        List<Map<String, String>> results = sparqlClient.query(String.format("""
            SELECT ?studentId ?date ?status ?filiere ?niveau ?ville WHERE {
                base:%s lod:hasApplication ?app .
                ?app lod:applicant ?student ;
                     lod:applicationDate ?date ;
                     lod:applicationStatus ?status .
                ?student dcterms:identifier ?studentId .
                OPTIONAL { ?student lod:level ?niveau . }
                OPTIONAL { ?student schema:addressLocality ?ville . }
                OPTIONAL {
                    ?student lod:enrolledIn ?prog .
                    ?prog rdfs:label ?filiere .
                }
            }
            ORDER BY DESC(?date)
            """, offerId));

        List<Map<String, Object>> items = results.stream().map(row -> {
            Map<String, Object> app = new HashMap<>(row);
            app.put("id", "app-" + row.get("studentId").hashCode());
            app.put("program", row.getOrDefault("filiere", ""));
            app.put("level", row.getOrDefault("niveau", ""));
            app.put("city", row.getOrDefault("ville", ""));
            app.put("appliedAt", row.get("date"));
            return app;
        }).collect(Collectors.toList());

        return Map.of("items", items, "total", items.size());
    }

    public void updateApplicationStatus(String offerId, String studentId, String newStatus) {
        sparqlClient.update(String.format("""
            DELETE {
                ?app lod:applicationStatus ?oldStatus .
            }
            WHERE {
                base:%s lod:hasApplication ?app .
                ?app lod:applicant base:%s ;
                     lod:applicationStatus ?oldStatus .
            }
            """, offerId, studentId));
        sparqlClient.update(String.format("""
            INSERT {
                ?app lod:applicationStatus "%s"@fr .
            }
            WHERE {
                base:%s lod:hasApplication ?app .
                ?app lod:applicant base:%s .
                FILTER NOT EXISTS { ?app lod:applicationStatus ?any }
            }
            """, newStatus, offerId, studentId));
    }

    public Map<String, Object> getStudentApplications(String studentId) {
        List<Map<String, String>> results = sparqlClient.query(String.format("""
            SELECT ?offre ?titre ?entreprise ?ville ?date ?status WHERE {
                base:%s lod:appliedTo ?offre .
                ?offre schema:title ?titre ;
                       lod:postedBy ?comp ;
                       schema:jobLocation ?ville .
                ?comp schema:name ?entreprise .
                OPTIONAL {
                    ?offre lod:hasApplication ?app .
                    ?app lod:applicant base:%s ;
                         lod:applicationDate ?date ;
                         lod:applicationStatus ?status .
                }
            }
            ORDER BY DESC(?date)
            """, studentId, studentId));

        List<Map<String, Object>> items = results.stream().map(row -> {
            Map<String, Object> app = new HashMap<>();
            String offerUri = row.get("offre");
            app.put("offerId", offerUri.substring(offerUri.lastIndexOf('/') + 1));
            app.put("title", row.get("titre"));
            app.put("company", row.get("entreprise"));
            app.put("city", row.get("ville"));
            app.put("appliedAt", row.getOrDefault("date", ""));
            app.put("status", row.getOrDefault("status", "En attente"));
            return app;
        }).collect(Collectors.toList());

        return Map.of("items", items, "total", items.size());
    }

    public Map<String, Object> getCompanyStats(String companyId) {
        Map<String, Object> byCompany = getByCompany(companyId);
        List<Map<String, Object>> offers = (List<Map<String, Object>>) byCompany.get("items");

        int totalOffers = offers.size();
        int openOffers = (int) offers.stream().filter(o -> "Ouverte".equals(o.get("status")) || String.valueOf(o.get("statut")).contains("Ouverte")).count();

        int totalApplications = 0;
        int acceptedApplications = 0;
        for (Map<String, Object> offer : offers) {
            String offerId = (String) offer.get("id");
            if (offerId != null) {
                try {
                    Map<String, Object> apps = getApplications(offerId);
                    List<?> appItems = (List<?>) apps.get("items");
                    totalApplications += appItems.size();
                } catch (Exception ignored) {}
            }
        }

        return Map.of(
            "totalOffers", totalOffers,
            "openOffers", openOffers,
            "totalApplications", totalApplications,
            "acceptedApplications", acceptedApplications
        );
    }

    public void bookmarkOffer(String offerId, String studentId) {
        String sparql = String.format("""
            INSERT DATA {
                base:%s lod:bookmarked base:%s .
            }
            """, studentId, offerId);
        sparqlClient.update(sparql);
    }

    public void removeBookmark(String offerId, String studentId) {
        String sparql = String.format("""
            DELETE DATA {
                base:%s lod:bookmarked base:%s .
            }
            """, studentId, offerId);
        sparqlClient.update(sparql);
    }

    public Map<String, Object> getBookmarks(String studentId) {
        List<Map<String, String>> results = sparqlClient.query(String.format("""
            SELECT ?offre ?titre ?entreprise ?ville ?niveau ?duree WHERE {
                base:%s lod:bookmarked ?offre .
                ?offre schema:title ?titre ;
                       lod:postedBy ?comp ;
                       schema:jobLocation ?ville ;
                       lod:levelRequired ?niveau ;
                       lod:durationMonths ?duree .
                ?comp schema:name ?entreprise .
            }
            ORDER BY ?titre
            """, studentId));

        List<Map<String, Object>> items = results.stream().map(row -> {
            Map<String, Object> b = new HashMap<>();
            String uri = row.get("offre");
            b.put("id", uri.substring(uri.lastIndexOf('/') + 1));
            b.put("title", row.get("titre"));
            b.put("company", row.get("entreprise"));
            b.put("city", row.get("ville"));
            b.put("level", row.get("niveau"));
            b.put("duration", row.get("duree"));
            return b;
        }).collect(Collectors.toList());

        return Map.of("items", items, "total", items.size());
    }
}
