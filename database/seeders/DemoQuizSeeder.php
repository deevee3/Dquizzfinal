<?php

namespace Database\Seeders;

use App\Models\AnswerOption;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\ResultOutcome;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoQuizSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::where('email', 'dvaughnhouse@gmail.com')->first()
            ?? User::where('email', 'dvaughn@dvaughnhouse.com')->first()
            ?? User::firstOrFail();

        // Re-runnable: remove any earlier copy (including soft-deleted) so the slug stays free.
        Quiz::withTrashed()->where('slug', 'drug-shortage-demo')->forceDelete();

        $quiz = Quiz::create([
            'owner_id' => $owner->id,
            'title' => 'Drug Shortages by the Numbers',
            'slug' => 'drug-shortage-demo',
            'description' => 'Five quick questions from the latest weekly drug-shortage digest. See how well you know the numbers — no sign-up needed.',
            'status' => 'published',
            'type' => 'assessment',
            'lead_capture_mode' => 'optional',
        ]);

        $questions = [
            [
                'text' => 'As of the latest weekly check, how many active drug-shortage bulletins did ASHP list?',
                'help' => 'The live bulletin count, retrieved October 26, 2026.',
                'options' => [
                    ['192', 1],
                    ['227', 0],
                    ['225', 0],
                    ['89', 0],
                ],
            ],
            [
                'text' => 'Which drug was the one new ASHP bulletin this week — created October 25, 2026?',
                'help' => 'Verified new by bulletin created date.',
                'options' => [
                    ['Vinblastine Sulfate Injection', 1],
                    ['Adalimumab-adbm Subcutaneous Injection', 0],
                    ['Bumetanide Injection', 0],
                    ['Reteplase Injection', 0],
                ],
            ],
            [
                'text' => 'What was ASHP’s Q3 2026 quarterly count of active shortages?',
                'help' => 'Published October 20, 2026 — down from 227 in Q2.',
                'options' => [
                    ['225', 1],
                    ['227', 0],
                    ['192', 0],
                    ['89', 0],
                ],
            ],
            [
                'text' => 'What share of new 2026 shortages involve products made by a single manufacturer?',
                'help' => 'ASHP Q3 2026 data, via AJMC.',
                'options' => [
                    ['48%', 1],
                    ['16%', 0],
                    ['10%', 0],
                    ['87%', 0],
                ],
            ],
            [
                'text' => 'The FDA’s shortages tab has now read 69 of 74 entries in shortage for how many straight weeks?',
                'help' => 'The FDA tab, checked live each week.',
                'options' => [
                    ['Four', 1],
                    ['Three', 0],
                    ['Two', 0],
                    ['Six', 0],
                ],
            ],
        ];

        foreach ($questions as $index => $q) {
            $question = Question::create([
                'quiz_id' => $quiz->id,
                'type' => 'single_choice',
                'question_text' => $q['text'],
                'help_text' => $q['help'],
                'order' => $index + 1,
                'required' => true,
            ]);

            // Shuffle the options so the correct answer is not always first.
            $options = $q['options'];
            shuffle($options);

            foreach ($options as $optIndex => [$label, $score]) {
                AnswerOption::create([
                    'question_id' => $question->id,
                    'label' => $label,
                    'value' => $label,
                    'score_value' => $score,
                    'order' => $optIndex + 1,
                ]);
            }
        }

        $outcomes = [
            [
                'name' => 'Shortage-literate',
                'description' => 'A perfect score. You track the shortage numbers the way the digest does — live counts, quarterly counts, and the concentration behind them.',
                'score_min' => 5,
                'score_max' => 5,
                'order' => 1,
            ],
            [
                'name' => 'Solid footing',
                'description' => 'You follow the trend — a few details slipped. The weekly digest keeps the numbers straight.',
                'score_min' => 3,
                'score_max' => 4,
                'order' => 2,
            ],
            [
                'name' => 'New to the numbers',
                'description' => 'The shortage picture moves every week. The weekly digest is the place to start.',
                'score_min' => 0,
                'score_max' => 2,
                'order' => 3,
            ],
        ];

        foreach ($outcomes as $outcome) {
            ResultOutcome::create(array_merge($outcome, ['quiz_id' => $quiz->id]));
        }

        $this->command->info("Demo quiz seeded: id={$quiz->id} slug={$quiz->slug} questions=5 outcomes=3 owner={$owner->email}");
    }
}
