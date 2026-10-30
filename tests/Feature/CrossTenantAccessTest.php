<?php

use App\Models\Campaign;
use App\Models\Lead;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Cross-tenant access control regression tests
|--------------------------------------------------------------------------
|
| Each test signs in as user A and tries to reach user B's data through a
| route that user A is allowed to call for their own resources.
|
*/

function makeQuiz(User $owner, string $slug): Quiz
{
    return Quiz::create([
        'owner_id' => $owner->id,
        'title' => 'Quiz '.$slug,
        'slug' => $slug,
        'status' => 'published',
        'type' => 'scorecard',
        'lead_capture_mode' => 'optional',
    ]);
}

function makeUser(): User
{
    // Super admin skips the subscription paywall so tests reach the controller.
    $user = User::factory()->create();
    $user->forceFill(['is_super_admin' => true])->save();

    return $user;
}

beforeEach(function () {
    $this->attacker = makeUser();
    $this->victim = makeUser();
    $this->attackerQuiz = makeQuiz($this->attacker, 'attacker-quiz');
    $this->victimQuiz = makeQuiz($this->victim, 'victim-quiz');
    $this->victimQuestion = Question::create([
        'quiz_id' => $this->victimQuiz->id,
        'type' => 'single_choice',
        'question_text' => 'Victim question',
        'order' => 1,
        'required' => true,
    ]);
});

test('test-login backdoor route does not exist', function () {
    User::factory()->create(['email' => 'test@dquizz.com']);

    $this->post('/login/test')->assertNotFound();
    $this->assertGuest();
});

test('cannot delete another user\'s question via own quiz', function () {
    $this->actingAs($this->attacker)->withSession(['auth_via' => 'password'])
        ->delete("/quizzes/{$this->attackerQuiz->id}/questions/{$this->victimQuestion->id}")
        ->assertNotFound();

    expect(Question::find($this->victimQuestion->id))->not->toBeNull();
});

test('cannot update another user\'s question via own quiz', function () {
    $this->actingAs($this->attacker)->withSession(['auth_via' => 'password'])
        ->put("/quizzes/{$this->attackerQuiz->id}/questions/{$this->victimQuestion->id}", [
            'type' => 'single_choice',
            'question_text' => 'pwned',
            'required' => true,
        ])
        ->assertNotFound();

    expect($this->victimQuestion->fresh()->question_text)->toBe('Victim question');
});

test('cannot subscribe another user\'s lead to own campaign', function () {
    $lead = Lead::create(['quiz_id' => $this->victimQuiz->id, 'email' => 'victim-lead@example.com']);
    $campaign = Campaign::create([
        'owner_id' => $this->attacker->id,
        'name' => 'Harvest',
        'status' => 'draft',
    ]);

    $this->actingAs($this->attacker)->withSession(['auth_via' => 'password'])
        ->post("/campaigns/{$campaign->id}/subscriptions", ['lead_id' => $lead->id])
        ->assertNotFound();

    expect($campaign->subscriptions()->count())->toBe(0);
});

test('owner can still delete their own question', function () {
    $this->actingAs($this->victim)->withSession(['auth_via' => 'password'])
        ->delete("/quizzes/{$this->victimQuiz->id}/questions/{$this->victimQuestion->id}")
        ->assertRedirect();

    expect(Question::find($this->victimQuestion->id))->toBeNull();
});
