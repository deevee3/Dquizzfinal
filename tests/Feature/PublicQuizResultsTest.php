<?php

use App\Models\Question;
use App\Models\Quiz;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

/*
|--------------------------------------------------------------------------
| Public quiz results access control (launch blocker #3 — IDOR)
|--------------------------------------------------------------------------
|
| Public results are addressed by an unguessable per-submission view
| token, never by the sequential submission ID. These tests pin that
| behaviour so the results route cannot silently regress to ID-based
| access (which let anyone enumerate other respondents' results).
|
*/

beforeEach(function () {
    $this->owner = User::factory()->create();

    $this->quiz = Quiz::create([
        'owner_id' => $this->owner->id,
        'title' => 'Readiness Scorecard',
        'slug' => 'readiness-scorecard',
        'status' => 'published',
        'type' => 'scorecard',
        'lead_capture_mode' => 'optional',
    ]);

    $this->submission = Submission::create([
        'quiz_id' => $this->quiz->id,
        'view_token' => Str::random(40),
        'total_score' => 17,
        'dimension_scores' => ['Strategy' => 17],
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest',
        'started_at' => now(),
        'submitted_at' => now(),
    ]);
});

test('respondent can view their results with the view token', function () {
    $this->get(route('public.quiz.results', [
        'slug' => $this->quiz->slug,
        'token' => $this->submission->view_token,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/results')
            ->where('submission.id', $this->submission->id)
            ->where('submission.total_score', 17)
        );
});

test('results are not viewable with a guessed token', function () {
    $this->get(route('public.quiz.results', [
        'slug' => $this->quiz->slug,
        'token' => Str::random(40),
    ]))->assertNotFound();
});

test('results cannot be enumerated by sequential submission id', function () {
    // The original IDOR: /q/{slug}/results/{submission-id} exposed any
    // respondent's results (lead_id + IP live on the submission row).
    $this->get(route('public.quiz.results', [
        'slug' => $this->quiz->slug,
        'token' => (string) $this->submission->id,
    ]))->assertNotFound();
});

test('a view token does not work under another quiz slug', function () {
    $otherQuiz = Quiz::create([
        'owner_id' => $this->owner->id,
        'title' => 'Other Quiz',
        'slug' => 'other-quiz',
        'status' => 'published',
        'type' => 'assessment',
        'lead_capture_mode' => 'optional',
    ]);

    $this->get(route('public.quiz.results', [
        'slug' => $otherQuiz->slug,
        'token' => $this->submission->view_token,
    ]))->assertNotFound();
});

test('submitting a quiz redirects the respondent to their own token results', function () {
    $question = Question::create([
        'quiz_id' => $this->quiz->id,
        'type' => 'scale',
        'question_text' => 'How ready are you?',
        'order' => 1,
        'required' => true,
    ]);

    $response = $this->post(route('public.quiz.submit', $this->quiz->slug), [
        'answers' => [
            ['question_id' => $question->id, 'answer_value' => '7'],
        ],
    ]);

    $newSubmission = Submission::where('quiz_id', $this->quiz->id)
        ->whereKeyNot($this->submission->id)
        ->firstOrFail();

    expect($newSubmission->view_token)->not->toBeEmpty();

    $resultsUrl = route('public.quiz.results', [
        'slug' => $this->quiz->slug,
        'token' => $newSubmission->view_token,
    ]);

    $response->assertRedirect($resultsUrl);

    // The respondent lands on a results page that actually renders.
    $this->get($resultsUrl)->assertOk();
});
